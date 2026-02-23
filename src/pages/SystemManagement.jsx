import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Clinic, IntakeForm, ConsentForm, AppointmentRequest } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Building2, ClipboardCheck, FileText, Calendar, Clock, TrendingUp, CheckCircle, Send, Inbox } from "lucide-react";
import userService from "@/components/services/userService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import PageHeader from "@/components/common/PageHeader";
import NetworkClinicStats from "@/components/dashboard/NetworkClinicStats";

export default function SystemManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [clinicStats, setClinicStats] = useState({});
  const [networkTotals, setNetworkTotals] = useState({
    intakeForms: 0,
    consentForms: 0,
    appointments: 0,
    pending: 0,
    activeClinics: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [clinicsData, intakeForms, consentForms, appointments] = await Promise.all([
        Clinic.list("-created_date"),
        IntakeForm.list("-created_date", 500),
        ConsentForm.list("-created_date", 500),
        AppointmentRequest.list("-created_date", 500),
      ]);

      setClinics(clinicsData);

      // Build per-clinic stats
      const stats = {};
      clinicsData.forEach(clinic => {
        const cIntake = intakeForms.filter(f => f.clinic_id === clinic.id);
        const cConsent = consentForms.filter(f => f.clinic_id === clinic.id);
        const cAppts = appointments.filter(f => f.clinic_id === clinic.id);

        // שנשלחו ללקוח = טפסים שיצאו מהמרפאה (published/sent) + consent שנשלחו
        const sentToClient = [
          ...cIntake.filter(f => ['published', 'sent'].includes(f.status)),
          ...cConsent.filter(f => ['pending', 'signed', 'completed', 'legally_sealed'].includes(f.status)),
        ].length;

        // התקבלו בחזרה וטרם טופלו = submitted/reviewed
        const receivedPending = [
          ...cIntake.filter(f => ['submitted', 'reviewed'].includes(f.status)),
          ...cConsent.filter(f => f.status === 'pending'),
        ].length;

        // הושלם טיפול = completed/archived/legally_sealed
        const completed = [
          ...cIntake.filter(f => ['completed', 'archived'].includes(f.status)),
          ...cConsent.filter(f => ['completed', 'legally_sealed'].includes(f.status)),
        ].length;

        stats[clinic.id] = {
          intakeForms: cIntake.length,
          consentForms: cConsent.length,
          appointments: cAppts.length,
          sentToClient,
          receivedPending,
          completed,
        };
      });

      setClinicStats(stats);

      // Network totals
      const sentAll = [
        ...intakeForms.filter(f => ['published', 'sent'].includes(f.status)),
        ...consentForms.filter(f => ['pending', 'signed', 'completed', 'legally_sealed'].includes(f.status)),
      ].length;
      const receivedPendingAll = [
        ...intakeForms.filter(f => ['submitted', 'reviewed'].includes(f.status)),
        ...consentForms.filter(f => f.status === 'pending'),
      ].length;
      const completedAll = [
        ...intakeForms.filter(f => ['completed', 'archived'].includes(f.status)),
        ...consentForms.filter(f => ['completed', 'legally_sealed'].includes(f.status)),
      ].length;

      setNetworkTotals({
        intakeForms: intakeForms.length,
        consentForms: consentForms.length,
        appointments: appointments.length,
        sentToClient: sentAll,
        receivedPending: receivedPendingAll,
        completed: completedAll,
        activeClinics: clinicsData.filter(c => c.is_active).length,
      });

    } catch (err) {
      console.error("Error loading system data:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader title="ניהול המערכת" description="טוען נתונים..." />
          <div className="flex justify-center py-12"><LoadingSpinner size="xl" /></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader title="ניהול המערכת" description="שגיאה בטעינת הנתונים" />
          <ErrorMessage error={error} onRetry={loadData} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="ניהול המערכת"
          description="סקירת נתוני הרשת לפי מרפאות וסה״כ"
        />

        {/* Network Totals */}
        <div>
          <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            סיכום רשת כולל
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <NetworkTotalCard icon={Building2} label="מרפאות פעילות" value={networkTotals.activeClinics} total={clinics.length} color="from-blue-400 to-blue-600" />
            <NetworkTotalCard icon={ClipboardCheck} label="טפסי היכרות" value={networkTotals.intakeForms} color="from-teal-400 to-teal-600" />
            <NetworkTotalCard icon={FileText} label="טפסי הסכמה" value={networkTotals.consentForms} color="from-purple-400 to-purple-600" />
            <NetworkTotalCard icon={Send} label="נשלחו ללקוח" value={networkTotals.sentToClient} color="from-cyan-400 to-cyan-600" />
            <NetworkTotalCard icon={Inbox} label="התקבלו - טרם טופלו" value={networkTotals.receivedPending} color={networkTotals.receivedPending > 0 ? "from-amber-400 to-amber-600" : "from-green-400 to-green-600"} />
            <NetworkTotalCard icon={CheckCircle} label="הושלם טיפול" value={networkTotals.completed} color="from-green-400 to-green-600" />
          </div>
        </div>

        {/* Per-clinic breakdown */}
        <div>
          <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            פירוט לפי מרפאות ({clinics.length})
          </h2>
          <NetworkClinicStats clinics={clinics} clinicStats={clinicStats} isLoading={false} />
        </div>
      </div>
    </div>
  );
}

function NetworkTotalCard({ icon: Icon, label, value, total, color, percentOf, percentLabel }) {
  const pct = percentOf > 0 ? Math.round((value / percentOf) * 100) : null;
  return (
    <Card className="bg-white/90 shadow-md border-blue-100 overflow-hidden">
      <CardContent className="p-0">
        <div className={`bg-gradient-to-br ${color} p-4 text-white`}>
          <Icon className="w-6 h-6 mb-2 opacity-90" />
          <p className="text-3xl font-bold">{value}</p>
          {total !== undefined && (
            <p className="text-xs opacity-80">מתוך {total} סה״כ</p>
          )}
          {pct !== null && (
            <p className="text-xs opacity-80">{pct}% {percentLabel}</p>
          )}
        </div>
        <div className="px-4 py-2">
          <p className="text-sm font-medium text-slate-700">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}