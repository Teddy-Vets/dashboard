import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  AlertTriangle,
  Building2,
  Calendar,
  ClipboardCheck,
  CreditCard,
  FileText,
  PawPrint,
  RefreshCw,
  Smile,
  UserPlus,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorMessage from '@/components/common/ErrorMessage';
import useStatsData from '@/hooks/useStatsData';
import StatCards from '@/components/stats/StatCards';
import MiniStats from '@/components/stats/MiniStats';
import FormsTrend from '@/components/stats/FormsTrend';
import PetTypeChart from '@/components/stats/PetTypeChart';
import HorizontalBarCard from '@/components/stats/HorizontalBarCard';
import ClinicComparison from '@/components/stats/ClinicComparison';
import FormFunnelCard from '@/components/stats/FormFunnelCard';
import WeeklyClientsCard from '@/components/stats/WeeklyClientsCard';
import {
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_LABELS,
  INTAKE_STATUS_COLORS,
  INTAKE_STATUS_LABELS,
  VISIT_TYPE_COLORS,
  VISIT_TYPE_LABELS,
  PLAN_COLORS,
  PLAN_LABELS,
  RANGE_OPTIONS,
  SEVERITY_COLORS,
  SEVERITY_LABELS,
} from '@/components/stats/statsConfig';

function StatsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array(4).fill(0).map((_, index) => (
          <Card key={index} className="border-slate-100 bg-white p-5">
            <Skeleton className="mb-3 h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </Card>
        ))}
      </div>
      <Card className="border-slate-100 bg-white p-6">
        <Skeleton className="h-[280px] w-full" />
      </Card>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-slate-100 bg-white p-6">
          <Skeleton className="h-[240px] w-full" />
        </Card>
        <Card className="border-slate-100 bg-white p-6">
          <Skeleton className="h-[240px] w-full" />
        </Card>
      </div>
    </div>
  );
}

export default function StatsDashboard() {
  const [range, setRange] = useState('6m');
  const [clinicFilter, setClinicFilter] = useState('all');
  const { data, clinics, isLoading, error, reload, updateWeeklyCount, importWeeklyCounts } = useStatsData({ range, clinicFilter });
  const entryClinicId = clinicFilter !== 'all' ? clinicFilter : (clinics.length === 1 ? clinics[0].id : null);

  const periodLabel = data
    ? `מציג נתונים מ-${format(data.period.start, 'dd/MM/yyyy')} ועד היום`
    : '';

  const statItems = useMemo(() => {
    if (!data) return [];
    return [
      { key: 'intake', label: 'טפסי היכרות', value: data.counts.intake.current, previous: data.counts.intake.previous, icon: FileText, color: 'blue' },
      { key: 'consent', label: 'טפסי הסכמה', value: data.counts.consent.current, previous: data.counts.consent.previous, icon: ClipboardCheck, color: 'purple' },
      { key: 'appointment', label: 'בקשות תור', value: data.counts.appointment.current, previous: data.counts.appointment.previous, icon: Calendar, color: 'green' },
      { key: 'subscription', label: 'הסכמי מנוי', value: data.counts.subscription.current, previous: data.counts.subscription.previous, icon: CreditCard, color: 'amber' },
    ];
  }, [data]);

  const miniItems = useMemo(() => {
    if (!data) return [];
    return [
      { key: 'clients', label: 'לקוחות רשומים', value: data.clients, icon: Users, iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
      { key: 'pets', label: 'חיות מחמד', value: data.pets, icon: PawPrint, iconBg: 'bg-emerald-100', iconText: 'text-emerald-600' },
      { key: 'anxiety', label: 'שאלוני חרדה בתקופה', value: data.counts.anxiety.current, icon: Smile, iconBg: 'bg-pink-100', iconText: 'text-pink-600' },
      { key: 'emergency', label: 'קריאות חירום בתקופה', value: data.counts.emergency.current, icon: AlertTriangle, iconBg: 'bg-rose-100', iconText: 'text-rose-600' },
    ];
  }, [data]);

  const visitTypeData = useMemo(() => {
    if (!data) return [];
    const rows = data.visitTypes || [];
    const known = Object.keys(VISIT_TYPE_LABELS).map((key) => {
      const row = rows.find((item) => item.first_visit === key);
      return { name: VISIT_TYPE_LABELS[key], value: row?.count || 0, color: VISIT_TYPE_COLORS[key] };
    });
    const extra = rows
      .filter((row) => !VISIT_TYPE_LABELS[row.first_visit])
      .map((row) => ({
        name: row.first_visit || 'לא צוין',
        value: row.count || 0,
        color: '#94a3b8',
      }));
    return [...known, ...extra];
  }, [data]);

  const intakeStatusData = useMemo(() => {
    if (!data) return [];
    const rows = data.intakeStatuses || [];
    const known = Object.keys(INTAKE_STATUS_LABELS).map((status) => {
      const row = rows.find((item) => item.status === status);
      return { name: INTAKE_STATUS_LABELS[status], value: row?.count || 0, color: INTAKE_STATUS_COLORS[status] };
    });
    const extra = rows
      .filter((row) => !INTAKE_STATUS_LABELS[row.status])
      .map((row) => ({ name: row.status || 'לא צוין', value: row.count || 0, color: '#94a3b8' }));
    return [...known, ...extra];
  }, [data]);

  const intakeCompletion = useMemo(() => {
    const total = intakeStatusData.reduce((sum, item) => sum + item.value, 0);
    const filled = intakeStatusData
      .filter((item) => ['ממתין לבדיקה', 'נבדק', 'הושלם'].includes(item.name))
      .reduce((sum, item) => sum + item.value, 0);
    return total ? Math.round((filled / total) * 100) : 0;
  }, [intakeStatusData]);

  const appointmentStatusData = useMemo(() => {
    if (!data) return [];
    return Object.keys(APPOINTMENT_STATUS_LABELS).map((status) => {
      const row = (data.appointmentStatuses || []).find((item) => item.status === status);
      return {
        name: APPOINTMENT_STATUS_LABELS[status],
        value: row?.count || 0,
        color: APPOINTMENT_STATUS_COLORS[status],
      };
    });
  }, [data]);

  const subscriptionPlanData = useMemo(() => {
    if (!data) return [];
    return (data.subscriptionPlans || [])
      .map((row) => ({
        name: PLAN_LABELS[row.selected_plan] || row.selected_plan || 'לא צוין',
        value: row.count || 0,
        color: PLAN_COLORS[row.selected_plan] || '#94a3b8',
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const emergencySeverityData = useMemo(() => {
    if (!data) return [];
    return (data.emergencySeverities || []).map((row) => ({
      name: SEVERITY_LABELS[row.severity] || row.severity || 'לא צוין',
      value: row.count || 0,
      color: SEVERITY_COLORS[row.severity] || '#94a3b8',
    }));
  }, [data]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-slate-800 md:text-3xl">סטטיסטיקות</h1>
            <p className="text-sm text-slate-600 md:text-base">
              ניתוח נתוני הטפסים, התורים והמנויים של המרפאה
            </p>
            {periodLabel && <p className="mt-1 text-xs text-slate-500">{periodLabel}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {clinics.length > 1 && (
              <div className="flex min-w-[180px] items-center gap-2">
                <Building2 className="h-4 w-4 shrink-0 text-blue-500" />
                <Select value={clinicFilter} onValueChange={setClinicFilter}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="בחירת מרפאה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {data?.isAdmin ? 'כל המרפאות' : 'כל המרפאות שלי'}
                    </SelectItem>
                    {clinics.map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-[170px] bg-white">
                <SelectValue placeholder="תקופה" />
              </SelectTrigger>
              <SelectContent>
                {RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={reload} disabled={isLoading} className="gap-2 bg-white">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              רענון
            </Button>
          </div>
        </div>

        {error ? (
          <ErrorMessage error={error} onRetry={reload} />
        ) : isLoading && !data ? (
          <StatsSkeleton />
        ) : data ? (
          <>
            <StatCards items={statItems} />
            <MiniStats items={miniItems} />

            <FormFunnelCard rows={data.funnels} />

            <WeeklyClientsCard
              rows={data.weekly}
              clinics={clinicFilter === 'all' ? clinics : clinics.filter((clinic) => clinic.id === clinicFilter)}
              weeklyRecords={data.weeklyRecords}
              canEdit={Boolean(entryClinicId)}
              onSave={(weekStart, value) => updateWeeklyCount({ clinicId: entryClinicId, weekStart, value })}
              onImport={importWeeklyCounts}
            />

            <FormsTrend buckets={data.buckets} />

            <div className="grid gap-5 lg:grid-cols-2">
              <PetTypeChart rows={data.petTypes} />
              <HorizontalBarCard
                title="סוג הביקור"
                subtitle="לקוח חדש מול לקוח חוזר, לפי טפסים שמולאו"
                icon={UserPlus}
                iconClassName="text-purple-500"
                data={visitTypeData}
                yAxisWidth={150}
                barColor="#8b5cf6"
                emptyText="לא מולאו טפסי היכרות בתקופה זו"
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              <HorizontalBarCard
                title="סטטוס טפסי היכרות"
                subtitle={`${intakeCompletion}% מהטפסים בתקופה מולאו על ידי הלקוחות`}
                icon={FileText}
                iconClassName="text-blue-500"
                data={intakeStatusData}
                yAxisWidth={130}
                emptyText="לא נפתחו טפסי היכרות בתקופה זו"
              />
              <HorizontalBarCard
                title="סטטוס בקשות תור"
                subtitle="מצב הטיפול בכל בקשה שנפתחה"
                icon={Calendar}
                iconClassName="text-emerald-500"
                data={appointmentStatusData}
                yAxisWidth={130}
                emptyText="לא נפתחו בקשות תור בתקופה זו"
              />
              <HorizontalBarCard
                title="התפלגות מסלולי מנוי"
                subtitle="לפי הסכמי מנוי בתקופה"
                icon={CreditCard}
                iconClassName="text-amber-500"
                data={subscriptionPlanData}
                yAxisWidth={130}
                emptyText="לא נחתמו הסכמי מנוי בתקופה זו"
              />
            </div>

            {data.counts.emergency.current > 0 && (
              <HorizontalBarCard
                title="קריאות חירום לפי דחיפות"
                subtitle="התפלגות דירוג הטריאז' בתקופה"
                icon={AlertTriangle}
                iconClassName="text-rose-500"
                data={emergencySeverityData}
                yAxisWidth={110}
                emptyText="אין קריאות חירום בתקופה זו"
              />
            )}

            {data.isAdmin && clinicFilter === 'all' && (
              <ClinicComparison rows={data.clinicComparison} periodLabel={periodLabel} />
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}