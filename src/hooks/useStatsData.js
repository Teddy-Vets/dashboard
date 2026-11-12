import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import userService from '@/components/services/userService';
import { startOfDay, startOfMonth, subDays, subMonths } from 'date-fns';
import { FORM_FUNNELS, FORM_TYPES, SECONDARY_TYPES } from '@/components/stats/statsConfig';

const WEEKLY_FUNNEL = FORM_FUNNELS.find((item) => item.key === 'intake') || { returnedStatuses: [], reviewedStatuses: [] };

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

  const reload = useCallback(() => setReloadToken((value) => value + 1), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const currentUser = await userService.getCurrentUser();
        if (!cancelled) setUser(currentUser);
        const isAdmin = currentUser?.role === 'admin';

        const clinicsResponse = await base44.entities.Clinic.list({ sort: 'name', limit: 100 });
        const allClinics = Array.isArray(clinicsResponse) ? clinicsResponse : (clinicsResponse.items || []);
        const userClinicIds = currentUser?.clinic_ids?.length
          ? currentUser.clinic_ids
          : (currentUser?.clinic_id ? [currentUser.clinic_id] : []);
        const visibleClinics = isAdmin
          ? allClinics
          : allClinics.filter((clinic) => userClinicIds.includes(clinic.id));

        if (cancelled) return;
        setClinics(visibleClinics);

        const { start, end, prevStart, unit } = getRangeBounds(range);
        const periodQuery = buildQuery(clinicFilter, start, end);
        const previousQuery = buildQuery(clinicFilter, prevStart, start);
        const clinicQuery = buildQuery(clinicFilter, null, null);

        const trendAggregates = await Promise.all(
          FORM_TYPES.map((type) =>
            base44.entities[type.entity].aggregate({
              query: periodQuery,
              dateBucket: { field: 'created_date', unit },
            })
          )
        );

        const buckets = buildBuckets(start, end, unit);
        const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));
        buckets.forEach((bucket) => {
          FORM_TYPES.forEach((type) => { bucket[type.key] = 0; });
        });

        const totals = FORM_TYPES.map((type, index) => {
          const rows = trendAggregates[index]?.rows || [];
          rows.forEach((row) => {
            const key = bucketKey(row.created_date, unit);
            const bucket = key ? bucketMap.get(key) : null;
            if (bucket) bucket[type.key] += row.count || 0;
          });
          return { key: type.key, current: sumRows(rows) };
        });

        const [
          previousTotals,
          secondaryTotals,
          clientsCount,
          petsCount,
          petTypeResult,
          visitTypeResult,
          intakeStatusResult,
          appointmentStatusResult,
          planResult,
          severityResult,
          consentStatusResult,
          anxietyStatusResult,
          weekOpenedAgg,
          weekReturnedAgg,
          weekReviewedAgg,
          weeklyCountResult,
          yearCountResult,
        ] = await Promise.all([
          Promise.all(FORM_TYPES.map((type) => base44.entities[type.entity].count(previousQuery))),
          Promise.all(SECONDARY_TYPES.map((type) => base44.entities[type.entity].count(periodQuery))),
          base44.entities.Client.count(clinicQuery),
          base44.entities.Pet.count(clinicQuery),
          base44.entities.IntakeForm.aggregate({ query: periodQuery, groupBy: 'pet_type' }),
          base44.entities.IntakeForm.aggregate({ query: periodQuery, groupBy: 'first_visit' }),
          base44.entities.IntakeForm.aggregate({ query: periodQuery, groupBy: 'status' }),
          base44.entities.AppointmentRequest.aggregate({ query: periodQuery, groupBy: 'status' }),
          base44.entities.SubscriptionAgreement.aggregate({ query: periodQuery, groupBy: 'selected_plan' }),
          base44.entities.EmergencyTriage.aggregate({ query: periodQuery, groupBy: 'severity' }),
          base44.entities.ConsentForm.aggregate({ query: periodQuery, groupBy: 'status' }),
          base44.entities.AnxietyQuestionnaire.aggregate({ query: periodQuery, groupBy: 'status' }),
          base44.entities.IntakeForm.aggregate({ query: periodQuery, dateBucket: { field: 'created_date', unit: 'week' } }),
          base44.entities.IntakeForm.aggregate({
            query: { ...periodQuery, status: { $in: WEEKLY_FUNNEL.returnedStatuses } },
            dateBucket: { field: 'created_date', unit: 'week' },
          }),
          base44.entities.IntakeForm.aggregate({
            query: { ...periodQuery, status: { $in: WEEKLY_FUNNEL.reviewedStatuses } },
            dateBucket: { field: 'created_date', unit: 'week' },
          }),
          base44.entities.WeeklyClientCount.filter({
            week_start: { $gte: toDateKey(start), $lte: toDateKey(end) },
            ...(clinicFilter && clinicFilter !== 'all' ? { clinic_id: clinicFilter } : {}),
          }),
          base44.entities.WeeklyClientCount.filter({
            week_start: { $gte: `${end.getFullYear()}-01-01`, $lte: `${end.getFullYear()}-12-31` },
          }),
        ]);

        const counts = {};
        FORM_TYPES.forEach((type, index) => {
          const current = totals.find((item) => item.key === type.key)?.current || 0;
          counts[type.key] = { current, previous: previousTotals[index] || 0 };
        });
        SECONDARY_TYPES.forEach((type, index) => {
          counts[type.key] = { current: secondaryTotals[index] || 0, previous: 0 };
        });

        let clinicComparison = [];
        if (isAdmin && clinicFilter === 'all') {
          const comparisonEntities = ['IntakeForm', 'ConsentForm', 'AppointmentRequest', 'SubscriptionAgreement'];
          const comparisonResults = await Promise.all(
            comparisonEntities.map((entity) =>
              base44.entities[entity].aggregate({ query: periodQuery, groupBy: 'clinic_id' })
            )
          );
          const rowsByClinic = new Map();
          allClinics.forEach((clinic) => {
            rowsByClinic.set(clinic.id, {
              clinicId: clinic.id,
              name: clinic.name?.trim() || 'ללא שם',
              intake: 0,
              consent: 0,
              appointment: 0,
              subscription: 0,
            });
          });
          comparisonEntities.forEach((entity, entityIndex) => {
            const field = FORM_TYPES[entityIndex].key;
            (comparisonResults[entityIndex]?.rows || []).forEach((row) => {
              const rowData = rowsByClinic.get(row.clinic_id);
              if (rowData) rowData[field] += row.count || 0;
            });
          });
          clinicComparison = Array.from(rowsByClinic.values())
            .map((row) => ({ ...row, total: row.intake + row.consent + row.appointment + row.subscription }))
            .sort((a, b) => b.total - a.total);
        }

        if (cancelled) return;

        const statusRows = {
          IntakeForm: intakeStatusResult?.rows || [],
          ConsentForm: consentStatusResult?.rows || [],
          AnxietyQuestionnaire: anxietyStatusResult?.rows || [],
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

        const countRecords = Array.isArray(weeklyCountResult) ? weeklyCountResult : (weeklyCountResult?.items || []);
        const newClientsByWeek = new Map();
        countRecords.forEach((record) => {
          const key = record.week_start;
          if (!key) return;
          newClientsByWeek.set(key, (newClientsByWeek.get(key) || 0) + (record.new_clients || 0));
        });

        const weekly = buildWeekBuckets(start, end).map((bucket) => ({
          weekStart: bucket.key,
          label: bucket.label,
          newClients: newClientsByWeek.get(bucket.key) || 0,
          sent: 0,
          returned: 0,
          reviewed: 0,
        }));
        const weeklyMap = new Map(weekly.map((row) => [row.weekStart, row]));
        const applyWeekly = (aggregate, field) => {
          (aggregate?.rows || []).forEach((row) => {
            const key = weekKey(row.created_date);
            const target = key ? weeklyMap.get(key) : null;
            if (target) target[field] += row.count || 0;
          });
        };
        applyWeekly(weekOpenedAgg, 'sent');
        applyWeekly(weekReturnedAgg, 'returned');
        applyWeekly(weekReviewedAgg, 'reviewed');

        setWeeklyRecords(countRecords);

        setData({
          isAdmin,
          range,
          period: { start, end },
          buckets,
          counts,
          clients: clientsCount || 0,
          pets: petsCount || 0,
          petTypes: petTypeResult?.rows || [],
          visitTypes: visitTypeResult?.rows || [],
          intakeStatuses: intakeStatusResult?.rows || [],
          appointmentStatuses: appointmentStatusResult?.rows || [],
          subscriptionPlans: planResult?.rows || [],
          emergencySeverities: severityResult?.rows || [],
          clinicComparison,
          funnels,
          weekly: weekly.reverse(),
          weeklyRecords: countRecords,
          yearWeeklyRecords: yearCountResult || [],
        });
      } catch (loadError) {
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

    reload();
    return { created: toCreate.length, updated: toUpdate.length };
  }, [reload]);

  return { data, clinics, user, isLoading, error, reload, updateWeeklyCount, importWeeklyCounts };
}