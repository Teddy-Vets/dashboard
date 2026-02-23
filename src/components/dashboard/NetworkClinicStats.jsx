import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ClipboardCheck, Calendar, FileText, CheckCircle, Send, Inbox } from "lucide-react";

export default function NetworkClinicStats({ clinics, clinicStats, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader><div className="h-5 bg-slate-200 rounded w-2/3" /></CardHeader>
            <CardContent><div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {clinics.map(clinic => {
        const s = clinicStats[clinic.id] || {};
        return (
          <Card key={clinic.id} className="bg-white/90 border-blue-100 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="flex items-center justify-between gap-2 text-base">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {clinic.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <span className="font-semibold text-slate-800">{clinic.name}</span>
                </div>
                <Badge className={clinic.is_active ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
                  {clinic.is_active ? "פעיל" : "לא פעיל"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {/* Row 1: totals */}
              <div className="grid grid-cols-3 gap-2">
                <FormTypeBox icon={ClipboardCheck} label="היכרות" total={s.intakeForms ?? 0} color="blue" />
                <FormTypeBox icon={FileText} label="הסכמה" total={s.consentForms ?? 0} color="purple" />
                <FormTypeBox icon={Calendar} label="תורים" total={s.appointments ?? 0} color="teal" />
              </div>

              {/* Divider + status section */}
              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-400 font-medium mb-2 text-right">סטטוס טפסים</p>
                <div className="grid grid-cols-2 gap-2">
                  {/* Intake breakdown */}
                  <FormStatusBox
                    icon={ClipboardCheck}
                    label="היכרות"
                    sent={s.intakeSent ?? 0}
                    pending={s.intakePending ?? 0}
                    completed={s.intakeCompleted ?? 0}
                    color="blue"
                  />
                  {/* Consent breakdown */}
                  <FormStatusBox
                    icon={FileText}
                    label="הסכמה"
                    sent={s.consentSent ?? 0}
                    pending={s.consentPending ?? 0}
                    completed={s.consentCompleted ?? 0}
                    color="purple"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function FormTypeBox({ icon: Icon, label, total, color }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    teal: "bg-teal-50 text-teal-600",
  };
  return (
    <div className={`${colorMap[color]} rounded-lg p-3 text-center`}>
      <div className="flex items-center justify-center gap-1 mb-1">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-bold">{total}</p>
    </div>
  );
}

function FormStatusBox({ icon: Icon, label, sent, pending, completed, color }) {
  const pendingPct = sent > 0 ? Math.round((pending / sent) * 100) : null;
  const colorMap = {
    blue: { icon: "text-blue-500", border: "border-blue-100" },
    purple: { icon: "text-purple-500", border: "border-purple-100" },
  };
  const c = colorMap[color];

  return (
    <div className={`rounded-lg border ${c.border} bg-slate-50 p-2.5`}>
      <div className={`flex items-center gap-1 mb-2 ${c.icon}`}>
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs font-medium text-slate-600">{label}</span>
      </div>
      <div className="space-y-1">
        <StatusRow icon={Send} label="נשלחו" value={sent} className="text-cyan-600" />
        <StatusRow
          icon={Inbox}
          label="ממתינים"
          value={pending}
          suffix={pendingPct !== null ? `(${pendingPct}%)` : null}
          className={pending > 0 ? "text-amber-600" : "text-slate-400"}
        />
        <StatusRow icon={CheckCircle} label="הושלמו" value={completed} className="text-green-600" />
      </div>
    </div>
  );
}

function StatusRow({ icon: Icon, label, value, suffix, className }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Icon className={`w-3 h-3 ${className}`} />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className={`text-xs font-bold ${className}`}>{value}</span>
        {suffix && <span className="text-xs text-slate-400">{suffix}</span>}
      </div>
    </div>
  );
}