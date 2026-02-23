import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ClipboardCheck, Calendar, FileText, CheckCircle, Clock, Send, Inbox } from "lucide-react";

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
        const stats = clinicStats[clinic.id] || {};
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
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-3">
                <StatItem icon={ClipboardCheck} label="טפסי היכרות" value={stats.intakeForms ?? 0} color="text-blue-600" bg="bg-blue-50" />
                <StatItem icon={FileText} label="טפסי הסכמה" value={stats.consentForms ?? 0} color="text-purple-600" bg="bg-purple-50" />
                <StatItem icon={Calendar} label="תורים" value={stats.appointments ?? 0} color="text-teal-600" bg="bg-teal-50" />
                <StatItem icon={Clock} label="ממתינים" value={stats.pending ?? 0} color="text-amber-600" bg="bg-amber-50" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function StatItem({ icon: Icon, label, value, color, bg }) {
  return (
    <div className={`${bg} rounded-lg p-3`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}