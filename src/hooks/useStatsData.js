import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import userService from '@/components/services/userService';
import { startOfDay, startOfMonth, subDays, subMonths } from 'date-fns';
import { FORM_FUNNELS, FORM_TYPES } from '@/components/stats/statsConfig';

const WEEKLY_FUNNEL = FORM_FUNNELS.find((item) => item.key === 'intake') || { returnedStatuses: [], reviewedStatuses: [] };

// כל סוג טופס נשלף בשאילתה אחת מרוכזת (מגמה + סטטוסים + מרפאות + מסלולים)
const FORM_GROUP_BY = {
  intake: ['clinic_id', 'status'],
  consent: ['clinic_id', 'status'],
  appointment: ['clinic_id', 'status'],
  subscription: ['clinic_id', 'status', 'selected_plan'],
};

// מטמון קצר כדי למנוע שליפה חוזרת של אותן סטטיסטיקות בכל מעבר בין סינונים
const STATS_CACHE_TTL = 3 * 60 * 1000;
const statsCache = new Map();
const statsInFlight = new Map();

const pad = (n) => String(n).padStart(2, '0');

export function getRangeBounds(range, now = new Date()) {
  if (range === '30d') {
    const start = startOfDay(subDays(now, 29));
    return { start, end: now, prevStart: subDays(start, 30), unit: 'day' };
  }
  if (range === 'year') {
    const start = startOfMonth(new Date(now.getFullYear(), 0, 1));
    return { start, end: now, prevStart: subMonths(start, 12), unit: 'month' };
  }
  const months = range === '3m' ? 3 : range === '12m' ? 12 : 6;
  const start = startOfMonth(subMonths(now, months - 1));
  return { start, end: now, prevStart: startOfMonth(subMonths(start, months)), unit: 'month' };
}

function buildQuery(clinicId, from, to) {
  const query = {};
  if (clinicId && clinicId !== 'all') query.clinic_id = clinicId;
  if (from) {
    query.created_date = { $gte: from.toISOString() };
    if (to) query.created_date.$lt = to.toISOString();
  }
  return query;
}

function bucketKey(value, unit) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const month = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
  return unit === 'day' ? `${month}-${pad(date.getUTCDate())}` : month;
}

function buildBuckets(start, end, unit) {
  const buckets = [];
  if (unit === 'day') {
    const cursor = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
    const last = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));
    while (cursor <= last) {
      buckets.push({
        key: `${cursor.getUTCFullYear()}-${pad(cursor.getUTCMonth() + 1)}-${pad(cursor.getUTCDate())}`,
        label: `${pad(cursor.getUTCDate())}/${pad(cursor.getUTCMonth() + 1)}`,
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return buckets;
  }
  const cursor = new Date(Date.UTC(start.getFullYear(), start.getMonth(), 1));
  const last = new Date(Date.UTC(end.getFullYear(), end.getMonth(), 1));
  while (cursor <= last) {
    buckets.push({
      key: `${cursor.getUTCFullYear()}-${pad(cursor.getUTCMonth() + 1)}`,
      label: `${pad(cursor.getUTCMonth() + 1)}/${String(cursor.getUTCFullYear()).slice(2)}`,
    });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return buckets;
}

const sumRows = (rows) => (rows || []).reduce((sum, row) => sum + (row.count || 0), 0);

const toDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function weekKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return toDateKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay()));
}

function currentWeekKey() {
  return toDateKey(weekStartDate(0));
}

function weekStartDate(offsetWeeks = 0) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + offsetWeeks * 7);
}

function buildWeekBuckets(start, end) {
  const buckets = [];
  const first = new Date(start.getFullYear(), start.getMonth(), start.getDate() - start.getDay());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  for (let cursor = first; cursor <= last; cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 7)) {
    const weekEnd = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 6);
    buckets.push({
      key: toDateKey(cursor),
      label: `${pad(cursor.getDate())}/${pad(cursor.getMonth() + 1)}-${pad(weekEnd.getDate())}/${pad(weekEnd.getMonth() + 1)}`,
    });
  }
  return buckets;
}

export default function useStatsData({ range, clinicFilter }) {
  const [data, setData] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [weeklyRecords, setWeeklyRecords] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const forceReloadRef = useRef(false);

  const reload = useCallback(() => {
    forceReloadRef.current = true;
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const cacheKey = `${range}|${clinicFilter}`;

    const applyPayload = (payload) => {
      if (cancelled || !payload) return;
      setUser(payload.user);
      setClinics(payload.clinics);
      setWeeklyRecords(payload.weeklyRecords);
      setData(payload.data);
    };

    const runLoad = async () => {
        const currentUser = await userService.getCurrentUser();
        const isAdmin = currentUser?.role === 'admin';

        const clinicsResponse = await base44.entities.Clinic.list({ sort: 'name', limit: 100 });
        const allClinics = Array.isArray(clinicsResponse) ? clinicsResponse : (clinicsResponse.items || []);
        const userClinicIds = currentUser?.clinic_ids?.length
          ? currentUser.clinic_ids
          : (currentUser?.clinic_id ? [currentUser.clinic_id] : []);
        const visibleClinics = isAdmin
          ? allClinics
          : allClinics.filter((clinic) => userClinicIds.includes(clinic.id));

        const { start, end, prevStart, unit } = getRangeBounds(range);
        const periodQuery = buildQuery(clinicFilter, start, end);
        const extendedQuery = buildQuery(clinicFilter, prevStart, end);
        const clinicQuery = buildQuery(clinicFilter, null, null);
        const lastWeekStart = weekStartDate(-1);
        const periodStartKey = bucketKey(start.toISOString(), unit) || '';

        const buckets = buildBuckets(start, end, unit);
        const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));
        buckets.forEach((bucket) => {
          FORM_TYPES.forEach((type) => { bucket[type.key] = 0; });
        });

        // שאילתה אחת לכל סוג טופס: מגמה בתקופה, מול התקופה הקודמת, סטטוסים ופילוח מרפאות
        const formAggregates = await Promise.all(
          FORM_TYPES.map((type) =>
            base44.entities[type.entity].aggregate({
              query: extendedQuery,
              groupBy: FORM_GROUP_BY[type.key] || ['clinic_id', 'status'],
              dateBucket: { field: 'created_date', unit },
            })
          )
        );

        const statusPerType = {};
        const clinicPerType = {};
        const clinicStatusPerType = {};
        const planTotals = new Map();
        const previousTotals = [];

        const totals = FORM_TYPES.map((type, index) => {
          const rows = formAggregates[index]?.rows || [];
          const statusMap = new Map();
          const clinicMap = new Map();
          const clinicStatusMap = new Map();
          let current = 0;
          let previous = 0;

          rows.forEach((row) => {
            const count = row.count || 0;
            const key = row.created_date ? bucketKey(row.created_date, unit) : null;
            if (key && key < periodStartKey) {
              previous += count;
              return;
            }
            current += count;
            const bucket = bucketMap.get(key);
            if (bucket) bucket[type.key] += count;
            if (row.status) {
              statusMap.set(row.status, (statusMap.get(row.status) || 0) + count);
              if (row.clinic_id) {
                const statuses = clinicStatusMap.get(row.clinic_id) || new Map();
                statuses.set(row.status, (statuses.get(row.status) || 0) + count);
                clinicStatusMap.set(row.clinic_id, statuses);
              }
            }
            if (row.clinic_id) clinicMap.set(row.clinic_id, (clinicMap.get(row.clinic_id) || 0) + count);
            if (row.selected_plan) planTotals.set(row.selected_plan, (planTotals.get(row.selected_plan) || 0) + count);
          });

          statusPerType[type.key] = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));
          clinicPerType[type.key] = clinicMap;
          clinicStatusPerType[type.key] = clinicStatusMap;
          previousTotals[index] = previous;
          return { key: type.key, current };
        });

        const [
          weeklyIntakeAgg,
          petTypeResult,
          visitTypeResult,
          anxietyResult,
          emergencyResult,
          clientsCount,
          petsCount,
          yearCountResult,
        ] = await Promise.all([
          base44.entities.IntakeForm.aggregate({
            query: periodQuery,
            groupBy: ['clinic_id', 'status'],
            dateBucket: { field: 'created_date', unit: 'week' },
          }),
          base44.entities.IntakeForm.aggregate({ query: periodQuery, groupBy: 'pet_type' }),
          base44.entities.IntakeForm.aggregate({ query: periodQuery, groupBy: 'first_visit' }),
          base44.entities.AnxietyQuestionnaire.aggregate({ query: periodQuery, groupBy: 'status' }),
          base44.entities.EmergencyTriage.aggregate({ query: periodQuery, groupBy: 'severity' }),
          base44.entities.Client.count(clinicQuery),
          base44.entities.Pet.count(clinicQuery),
          base44.entities.WeeklyClientCount.filter({
            week_start: {
              $gte: toDateKey(start) < `${end.getFullYear()}-01-01` ? toDateKey(start) : `${end.getFullYear()}-01-01`,
              $lte: `${end.getFullYear()}-12-31`,
            },
          }),
        ]);

        const counts = {};
        FORM_TYPES.forEach((type, index) => {
          counts[type.key] = { current: totals[index]?.current || 0, previous: previousTotals[index] || 0 };
        });
        counts.anxiety = { current: sumRows(anxietyResult?.rows || []), previous: 0 };
        counts.emergency = { current: sumRows(emergencyResult?.rows || []), previous: 0 };

        const intakeStatusRows = statusPerType.intake || [];
        const weeklyIntakeRows = weeklyIntakeAgg?.rows || [];

        const clinicFunnel = (clinicId) => {
          const statuses = clinicStatusPerType.intake?.get(clinicId);
          const result = { sent: 0, returned: 0, reviewed: 0 };
          if (!statuses) return result;
          statuses.forEach((count, status) => {
            result.sent += count;
            if (WEEKLY_FUNNEL.returnedStatuses.includes(status)) result.returned += count;
            if (WEEKLY_FUNNEL.reviewedStatuses.includes(status)) result.reviewed += count;
          });
          return result;
        };

        let clinicComparison = [];
        if (isAdmin && clinicFilter === 'all') {
          clinicComparison = allClinics
            .map((clinic) => {
              const row = {
                clinicId: clinic.id,
                name: clinic.name?.trim() || 'ללא שם',
                intake: clinicPerType.intake?.get(clinic.id) || 0,
                consent: clinicPerType.consent?.get(clinic.id) || 0,
                appointment: clinicPerType.appointment?.get(clinic.id) || 0,
                subscription: clinicPerType.subscription?.get(clinic.id) || 0,
              };
              return { ...row, total: row.intake + row.consent + row.appointment + row.subscription };
            })
            .sort((a, b) => b.total - a.total);
        }

        const statusRows = {
          IntakeForm: intakeStatusRows,
          ConsentForm: statusPerType.consent || [],
          AnxietyQuestionnaire: anxietyResult?.rows || [],
        };

        const funnels = FORM_FUNNELS.map((item) => {
          const rows = statusRows[item.entity] || [];
          const countStatuses = (statuses) =>
            rows.filter((row) => statuses.includes(row.status)).reduce((sum, row) => sum + (row.count || 0), 0);

          return {
            key: item.key,
            label: item.label,
            color: item.color,
            sent: sumRows(rows),
            returned: countStatuses(item.returnedStatuses),
            reviewed: countStatuses(item.reviewedStatuses),
          };
        });

        const yearRecords = Array.isArray(yearCountResult) ? yearCountResult : (yearCountResult?.items || []);
        const periodFrom = toDateKey(start);
        const periodTo = toDateKey(end);
        const countRecords = yearRecords.filter(
          (record) => record.week_start && record.week_start >= periodFrom && record.week_start <= periodTo
        );
        const newClientsByWeek = new Map();
        countRecords.forEach((record) => {
          const key = record.week_start;
          if (!key) return;
          newClientsByWeek.set(key, (newClientsByWeek.get(key) || 0) + (record.new_clients || 0));
        });

        const activeWeek = currentWeekKey();
        const weekly = buildWeekBuckets(start, end)
          .filter((bucket) => bucket.key !== activeWeek)
          .map((bucket) => ({
            weekStart: bucket.key,
            label: bucket.label,
            newClients: newClientsByWeek.get(bucket.key) || 0,
            sent: 0,
            returned: 0,
            reviewed: 0,
          }));
        const weeklyMap = new Map(weekly.map((row) => [row.weekStart, row]));
        weeklyIntakeRows.forEach((row) => {
          const key = weekKey(row.created_date);
          const target = key ? weeklyMap.get(key) : null;
          if (!target) return;
          const count = row.count || 0;
          target.sent += count;
          if (WEEKLY_FUNNEL.returnedStatuses.includes(row.status)) target.returned += count;
          if (WEEKLY_FUNNEL.reviewedStatuses.includes(row.status)) target.reviewed += count;
        });

        const newClientsPerClinic = new Map();
        countRecords.forEach((record) => {
          if (!record.clinic_id) return;
          newClientsPerClinic.set(record.clinic_id, (newClientsPerClinic.get(record.clinic_id) || 0) + (record.new_clients || 0));
        });

        const newClientsByClinic = clinicFilter === 'all'
          ? visibleClinics
              .map((clinic) => {
                const funnel = clinicFunnel(clinic.id);
                return {
                  clinicId: clinic.id,
                  name: clinic.name?.trim() || 'ללא שם',
                  newClients: newClientsPerClinic.get(clinic.id) || 0,
                  sent: funnel.sent,
                  returned: funnel.returned,
                  reviewed: funnel.reviewed,
                };
              })
              .sort((a, b) => b.newClients - a.newClients || a.name.localeCompare(b.name, 'he'))
          : [];

        // השבוע האחרון שמופיעים בו נתונים בקובץ שמיובא (למשל השבוע הנוכחי שהוזן עכשיו)
        const lastDataWeekKey = countRecords.reduce(
          (latest, record) =>
            record.week_start && (record.new_clients || 0) > 0 && record.week_start > latest
              ? record.week_start
              : latest,
          ''
        );
        const lastWeekKey = lastDataWeekKey || toDateKey(lastWeekStart);
        const lastWeekDate = new Date(`${lastWeekKey}T00:00:00`);
        const [lastWeekBucket] = buildWeekBuckets(lastWeekDate, lastWeekDate);

        const lastWeekClients = new Map();
        countRecords.forEach((record) => {
          if (record.week_start !== lastWeekKey || !record.clinic_id) return;
          lastWeekClients.set(record.clinic_id, (lastWeekClients.get(record.clinic_id) || 0) + (record.new_clients || 0));
        });

        const lastWeekFunnel = new Map();
        weeklyIntakeRows.forEach((row) => {
          if (!row.clinic_id || weekKey(row.created_date) !== lastWeekKey) return;
          const entry = lastWeekFunnel.get(row.clinic_id) || { sent: 0, returned: 0, reviewed: 0 };
          const count = row.count || 0;
          entry.sent += count;
          if (WEEKLY_FUNNEL.returnedStatuses.includes(row.status)) entry.returned += count;
          if (WEEKLY_FUNNEL.reviewedStatuses.includes(row.status)) entry.reviewed += count;
          lastWeekFunnel.set(row.clinic_id, entry);
        });

        const lastWeek = {
          weekStart: lastWeekKey,
          label: lastWeekBucket?.label || lastWeekKey,
          rows: visibleClinics
            .map((clinic) => {
              const funnel = lastWeekFunnel.get(clinic.id) || { sent: 0, returned: 0, reviewed: 0 };
              return {
                clinicId: clinic.id,
                name: clinic.name?.trim() || 'ללא שם',
                newClients: lastWeekClients.get(clinic.id) || 0,
                sent: funnel.sent,
                returned: funnel.returned,
                reviewed: funnel.reviewed,
              };
            })
            .sort((a, b) => b.newClients - a.newClients || b.sent - a.sent || a.name.localeCompare(b.name, 'he')),
        };

        return {
          user: currentUser,
          clinics: visibleClinics,
          weeklyRecords: yearRecords,
          data: {
          isAdmin,
          range,
          period: { start, end },
          buckets,
          counts,
          clients: clientsCount || 0,
          pets: petsCount || 0,
          petTypes: petTypeResult?.rows || [],
          visitTypes: visitTypeResult?.rows || [],
          intakeStatuses: intakeStatusRows,
          appointmentStatuses: statusPerType.appointment || [],
          subscriptionPlans: Array.from(planTotals.entries()).map(([selected_plan, count]) => ({ selected_plan, count })),
          emergencySeverities: emergencyResult?.rows || [],
          clinicComparison,
          funnels,
          weekly: weekly.reverse(),
          weeklyRecords: countRecords,
          yearWeeklyRecords: yearRecords,
          newClientsByClinic,
          lastWeek,
          },
        };
    };

    let rateLimitRetried = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const cached = statsCache.get(cacheKey);
      const force = forceReloadRef.current;
      forceReloadRef.current = false;

      if (cached && !force && Date.now() - cached.time < STATS_CACHE_TTL) {
        applyPayload(cached.payload);
        setIsLoading(false);
        return;
      }

      try {
        let shared = statsInFlight.get(cacheKey);
        if (!shared) {
          shared = runLoad()
            .then((payload) => {
              statsCache.set(cacheKey, { time: Date.now(), payload });
              return payload;
            })
            .finally(() => statsInFlight.delete(cacheKey));
          statsInFlight.set(cacheKey, shared);
        }
        applyPayload(await shared);
      } catch (loadError) {
        const message = String(loadError?.message || '');
        if (!cancelled && /rate limit/i.test(message) && !rateLimitRetried) {
          rateLimitRetried = true;
          const match = message.match(/retry after (\d+)\s*s/i);
          const waitSeconds = Math.min(Math.max(Number(match?.[1] || 20) + 2, 5), 65);
          window.setTimeout(() => { if (!cancelled) load(); }, waitSeconds * 1000);
          return;
        }
        if (!cancelled) setError(loadError);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [range, clinicFilter, reloadToken]);

  const updateWeeklyCount = useCallback(async ({ clinicId, weekStart, value }) => {
    const numeric = Number(value) || 0;
    const existing = weeklyRecords.find((record) => record.clinic_id === clinicId && record.week_start === weekStart);

    if (existing) {
      await base44.entities.WeeklyClientCount.update(existing.id, { new_clients: numeric });
      setWeeklyRecords((prev) => prev.map((record) => (record.id === existing.id ? { ...record, new_clients: numeric } : record)));
    } else {
      const created = await base44.entities.WeeklyClientCount.create({ clinic_id: clinicId, week_start: weekStart, new_clients: numeric });
      setWeeklyRecords((prev) => [...prev, created]);
    }

    statsCache.clear();
    setData((prev) => prev ? {
      ...prev,
      weekly: prev.weekly.map((row) => (row.weekStart === weekStart ? { ...row, newClients: numeric } : row)),
    } : prev);
  }, [weeklyRecords]);

  const importWeeklyCounts = useCallback(async (entries = []) => {
    if (!entries.length) return { created: 0, updated: 0 };

    const clinicIds = Array.from(new Set(entries.map((entry) => entry.clinic_id)));
    const weeks = Array.from(new Set(entries.map((entry) => entry.week_start)));

    const response = await base44.entities.WeeklyClientCount.filter({
      clinic_id: { $in: clinicIds },
      week_start: { $in: weeks },
    });
    const existing = Array.isArray(response) ? response : (response?.items || []);
    const existingMap = new Map(existing.map((record) => [`${record.clinic_id}|${record.week_start}`, record]));

    const toCreate = [];
    const toUpdate = [];
    entries.forEach((entry) => {
      const found = existingMap.get(`${entry.clinic_id}|${entry.week_start}`);
      if (found) {
        toUpdate.push({
          id: found.id,
          clinic_id: entry.clinic_id,
          week_start: entry.week_start,
          new_clients: entry.new_clients,
        });
      } else {
        toCreate.push(entry);
      }
    });

    if (toCreate.length) await base44.entities.WeeklyClientCount.bulkCreate(toCreate);
    if (toUpdate.length) await base44.entities.WeeklyClientCount.bulkUpdate(toUpdate);

    statsCache.clear();
    reload();
    return { created: toCreate.length, updated: toUpdate.length };
  }, [reload]);

  return { data, clinics, user, isLoading, error, reload, updateWeeklyCount, importWeeklyCounts };
}