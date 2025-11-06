import React, { useState, useEffect } from "react";
import { IntakeForm, ConsentForm, AppointmentRequest } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import userService from "@/components/services/userService";
import { getEntityList, safeApiCall } from "@/components/utils/apiHelpers";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import PageHeader from "@/components/common/PageHeader";
import SystemHealthWidget from "@/components/dashboard/SystemHealthWidget";
import { isToday } from "@/components/utils/dateUtils";

export default function SystemManagementPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingForms, setPendingForms] = useState([]);
  const [todayAppointmentsCount, setTodayAppointmentsCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await userService.getCurrentUser();
      setCurrentUser(user);

      // טעינת טפסים ממתינים
      const [intakeForms, consentForms, appointments] = await Promise.all([
        safeApiCall(async () => {
          if (user.role === "admin") {
            return await getEntityList(IntakeForm, { status: 'draft' }, '-created_date', null, 'IntakeForm');
          } else if (user.clinic_id) {
            return await getEntityList(IntakeForm, { clinic_id: user.clinic_id, status: 'draft' }, '-created_date', null, 'IntakeForm');
          }
          return [];
        }),
        safeApiCall(async () => {
          if (user.role === "admin") {
            return await getEntityList(ConsentForm, { status: 'pending' }, '-created_date', null, 'ConsentForm');
          } else if (user.clinic_id) {
            return await getEntityList(ConsentForm, { clinic_id: user.clinic_id, status: 'pending' }, '-created_date', null, 'ConsentForm');
          }
          return [];
        }),
        safeApiCall(async () => {
          if (user.role === "admin") {
            return await getEntityList(AppointmentRequest, {}, '-created_date', null, 'AppointmentRequest');
          } else if (user.clinic_id) {
            return await getEntityList(AppointmentRequest, { clinic_id: user.clinic_id }, '-created_date', null, 'AppointmentRequest');
          }
          return [];
        })
      ]);

      // איחוד טפסים ממתינים
      const allPending = [
        ...(intakeForms || []),
        ...(consentForms || [])
      ];
      setPendingForms(allPending);

      // ספירת תורים להיום
      const todayAppts = (appointments || []).filter(apt => 
        apt.appointment_datetime && isToday(apt.appointment_datetime)
      );
      setTodayAppointmentsCount(todayAppts.length);

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
          <PageHeader
            title="ניהול המערכת"
            description="טוען נתונים..."
          />
          <div className="flex justify-center py-12">
            <LoadingSpinner size="xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="ניהול המערכת"
            description="שגיאה בטעינת הנתונים"
          />
          <ErrorMessage error={error} onRetry={loadData} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="ניהול המערכת"
          description="מעקב אחר בריאות המערכת ופעילות הטפסים"
        />

        <Card className="mb-6 bg-white/90 backdrop-blur-sm shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Activity className="w-5 h-5" />
              סטטוס המערכת
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <SystemHealthWidget
              pendingForms={pendingForms}
              todayAppointmentsCount={todayAppointmentsCount}
              avgResponseHours={0}
              completionRate={0}
              isLoading={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}