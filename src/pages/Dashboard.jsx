import React, { useState, useEffect } from "react";
import { IntakeForm } from "@/entities/IntakeForm";
import { ConsentForm } from "@/entities/ConsentForm";
import { Client } from "@/entities/Client";
import { Pet } from "@/entities/Pet";
import { Clinic } from "@/entities/Clinic";
import { AnxietyQuestionnaire } from "@/entities/AnxietyQuestionnaire";
import { AppointmentRequest } from "@/entities/AppointmentRequest";
import { EmergencyTriage } from "@/entities/EmergencyTriage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  ClipboardCheck,
  HeartPulse,
  Smile,
  Stethoscope,
  BookUser,
  LogOut,
  LogIn,
  Menu,
  Building2 as ClinicIcon,
  Calendar,
  Megaphone,
  TrendingUp,
  AlertCircle,
  FileText,
  Eye,
  Plus
} from "lucide-react";
import { formatDateTimeInIsrael, isToday } from "@/components/utils/dateUtils";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils/urlHelpers";
import { motion } from "framer-motion";

import userService from "@/components/services/userService";
import { getEntityList, safeApiCall } from "@/components/utils/apiHelpers";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { StatsSkeleton } from "@/components/common/LoadingSkeleton";
import PageHeader from "@/components/common/PageHeader";

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    totalIntakeForms: 0,
    totalConsentForms: 0,
    totalClients: 0,
    totalPets: 0,
    todayIntakeForms: 0,
    todayConsentForms: 0,
    totalAnxiety: 0,
    totalAppointments: 0,
    totalEmergencyTriage: 0,
    todayEmergencyTriage: 0
  });

  const [recentForms, setRecentForms] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [formsByClinic, setFormsByClinic] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await userService.getCurrentUser();
      setCurrentUser(user);

      if (user.role === "admin") {
        await loadAdminDashboard(user);
      } else {
        await loadUserDashboard(user);
      }

    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserDashboard = async (user) => {
    const clinicId = user.clinic_id;
    
    // בדיקה אם למשתמש יש clinic_id מוגדר
    if (!clinicId) {
      throw new Error('המשתמש לא משויך למרפאה. אנא פנה למנהל המערכת לשיוך למרפאה.');
    }
    
    const [
      intakeForms,
      consentForms,
      anxietyQuestionnaires,
      emergencyTriages,
      appointmentRequests,
      clients,
      pets
    ] = await Promise.all([
      safeApiCall(() => getEntityList(IntakeForm, { clinic_id: clinicId }, "-created_date", 20, 'IntakeForm')),
      safeApiCall(() => getEntityList(ConsentForm, { clinic_id: clinicId }, "-created_date", 20, 'ConsentForm')),
      safeApiCall(() => getEntityList(AnxietyQuestionnaire, { clinic_id: clinicId }, "-created_date", 20, 'AnxietyQuestionnaire')),
      safeApiCall(() => getEntityList(EmergencyTriage, { clinic_id: clinicId }, "-created_date", 20, 'EmergencyTriage')),
      safeApiCall(() => getEntityList(AppointmentRequest, { clinic_id: clinicId }, "-created_date", 20, 'AppointmentRequest')),
      safeApiCall(() => getEntityList(Client, { clinic_id: clinicId }, "-created_date", null, 'Client')),
      safeApiCall(() => getEntityList(Pet, { clinic_id: clinicId }, "-created_date", null, 'Pet'))
    ]);

    const allForms = [
      ...(intakeForms || []).map(f => ({ ...f, formType: 'intake', formTypeLabel: 'טופס היכרות' })),
      ...(consentForms || []).map(f => ({ ...f, formType: 'consent', formTypeLabel: 'טופס הסכמה' })),
      ...(anxietyQuestionnaires || []).map(f => ({ ...f, formType: 'anxiety', formTypeLabel: 'שאלון חרדה' })),
      ...(emergencyTriages || []).map(f => ({ ...f, formType: 'emergency', formTypeLabel: 'טריאז\' חירום' })),
      ...(appointmentRequests || []).map(f => ({ ...f, formType: 'appointment', formTypeLabel: 'בקשת תור' }))
    ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 20);

    setRecentForms(allForms);

    const todayIntake = intakeForms?.filter(f => isToday(f.created_date)) || [];
    const todayConsent = consentForms?.filter(f => isToday(f.created_date)) || [];
    const todayEmergency = emergencyTriages?.filter(f => isToday(f.created_date)) || [];

    setStats({
      totalIntakeForms: intakeForms?.length || 0,
      totalConsentForms: consentForms?.length || 0,
      totalClients: clients?.length || 0,
      totalPets: pets?.length || 0,
      todayIntakeForms: todayIntake.length,
      todayConsentForms: todayConsent.length,
      totalAnxiety: anxietyQuestionnaires?.length || 0,
      totalAppointments: appointmentRequests?.length || 0,
      totalEmergencyTriage: emergencyTriages?.length || 0,
      todayEmergencyTriage: todayEmergency.length
    });
  };

  const loadAdminDashboard = async (user) => {
    // טעינה מקבילה של כל הנתונים בקריאה אחת - הרבה יותר מהיר
    const [
      allClinics,
      allIntake,
      allConsent,
      allAnxiety,
      allAppointments,
      allEmergency
    ] = await Promise.all([
      safeApiCall(() => getEntityList(Clinic, { is_active: true })),
      safeApiCall(() => getEntityList(IntakeForm, {}, "-created_date", 100, 'IntakeForm')),
      safeApiCall(() => getEntityList(ConsentForm, {}, "-created_date", 100, 'ConsentForm')),
      safeApiCall(() => getEntityList(AnxietyQuestionnaire, {}, "-created_date", 100, 'AnxietyQuestionnaire')),
      safeApiCall(() => getEntityList(AppointmentRequest, {}, "-created_date", 100, 'AppointmentRequest')),
      safeApiCall(() => getEntityList(EmergencyTriage, {}, "-created_date", 100, 'EmergencyTriage'))
    ]);

    setClinics(allClinics || []);

    // קיבוץ הטפסים לפי מרפאה בצד הלקוח
    const formsByClinicData = {};
    
    for (const clinic of (allClinics || [])) {
      const clinicForms = [
        ...(allIntake || []).filter(f => f.clinic_id === clinic.id).slice(0, 15).map(f => ({ ...f, formType: 'intake', formTypeLabel: 'טופס היכרות' })),
        ...(allConsent || []).filter(f => f.clinic_id === clinic.id).slice(0, 15).map(f => ({ ...f, formType: 'consent', formTypeLabel: 'טופס הסכמה' })),
        ...(allAnxiety || []).filter(f => f.clinic_id === clinic.id).slice(0, 15).map(f => ({ ...f, formType: 'anxiety', formTypeLabel: 'שאלון חרדה' })),
        ...(allEmergency || []).filter(f => f.clinic_id === clinic.id).slice(0, 15).map(f => ({ ...f, formType: 'emergency', formTypeLabel: 'טריאז\' חירום' })),
        ...(allAppointments || []).filter(f => f.clinic_id === clinic.id).slice(0, 15).map(f => ({ ...f, formType: 'appointment', formTypeLabel: 'בקשת תור' }))
      ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 15);

      formsByClinicData[clinic.id] = clinicForms;
    }

    setFormsByClinic(formsByClinicData);

    const todayIntake = allIntake?.filter(f => isToday(f.created_date)) || [];
    const todayConsent = allConsent?.filter(f => isToday(f.created_date)) || [];
    const todayEmergency = allEmergency?.filter(f => isToday(f.created_date)) || [];

    setStats({
      totalIntakeForms: allIntake?.length || 0,
      totalConsentForms: allConsent?.length || 0,
      totalClients: 0,
      totalPets: 0,
      todayIntakeForms: todayIntake.length,
      todayConsentForms: todayConsent.length,
      totalAnxiety: allAnxiety?.length || 0,
      totalAppointments: allAppointments?.length || 0,
      totalEmergencyTriage: allEmergency?.length || 0,
      todayEmergencyTriage: todayEmergency.length
    });
  };

  const getStatusBadge = (form) => {
    const statusConfig = {
      draft: { label: "טיוטה", color: "bg-gray-100 text-gray-800" },
      submitted: { label: "הוגש", color: "bg-blue-100 text-blue-800" },
      pending: { label: "ממתין", color: "bg-yellow-100 text-yellow-800" },
      signed: { label: "נחתם", color: "bg-green-100 text-green-800" },
      completed: { label: "הושלם", color: "bg-green-100 text-green-800" },
      reviewed: { label: "נבדק", color: "bg-purple-100 text-purple-800" },
      contacted: { label: "נוצר קשר", color: "bg-indigo-100 text-indigo-800" },
      confirmed: { label: "אושר", color: "bg-green-100 text-green-800" },
      cancelled: { label: "בוטל", color: "bg-red-100 text-red-800" },
      RED: { label: "חירום קריטי", color: "bg-red-100 text-red-800" },
      ORANGE: { label: "דחוף", color: "bg-orange-100 text-orange-800" },
      YELLOW: { label: "מעקב", color: "bg-yellow-100 text-yellow-800" },
      GREEN: { label: "רגיל", color: "bg-green-100 text-green-800" }
    };

    const status = form.status || form.severity || 'draft';
    const config = statusConfig[status] || statusConfig.draft;

    return (
      <Badge className={`${config.color} border text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const getViewLink = (form) => {
    switch (form.formType) {
      case 'intake':
        return createPageUrl("ViewIntakeForm", { id: form.id });
      case 'consent':
        return createPageUrl("ViewConsentForm", { id: form.id });
      case 'anxiety':
        return createPageUrl("ViewAnxietyQuestionnaire", { id: form.id });
      case 'emergency':
        return createPageUrl("ViewEmergencyTriage", { id: form.id });
      case 'appointment':
        return createPageUrl("ManageAppointments");
      default:
        return "#";
    }
  };

  const renderMobileFormCard = (form, index) => (
    <motion.div
      key={`${form.formType}-${form.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="bg-white rounded-lg border border-blue-100 p-4 shadow-sm hover:shadow-md transition-shadow">
      
      <div className="flex justify-between items-start mb-3">
        <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs">
          {form.formTypeLabel}
        </Badge>
        {getStatusBadge(form)}
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">בעלים:</span>
          <span className="font-medium text-gray-800">{form.owner_name || '-'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">חיית מחמד:</span>
          <span className="font-medium text-gray-800">{form.pet_name || '-'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">תאריך:</span>
          <span className="text-gray-600">{formatDateTimeInIsrael(form.created_date, 'dd/MM/yy HH:mm')}</span>
        </div>
      </div>

      <Link to={getViewLink(form)}>
        <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-800 hover:bg-blue-50">
          <Eye className="w-4 h-4 ml-1" />
          צפייה
        </Button>
      </Link>
    </motion.div>
  );

  const renderFormsSection = (forms, title = null) => (
    <div className="mb-6">
      {/* Desktop View - Hidden on mobile */}
      <Card className="hidden md:block bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg">
        {title && (
          <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="text-right p-3 text-sm font-medium text-slate-600">תאריך</th>
                  <th className="text-right p-3 text-sm font-medium text-slate-600">סוג טופס</th>
                  <th className="text-right p-3 text-sm font-medium text-slate-600">בעלים</th>
                  <th className="text-right p-3 text-sm font-medium text-slate-600">חיית מחמד</th>
                  <th className="text-right p-3 text-sm font-medium text-slate-600">סטטוס</th>
                  <th className="text-right p-3 text-sm font-medium text-slate-600">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {forms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-slate-500 py-8">
                      אין טפסים להצגה
                    </td>
                  </tr>
                ) : (
                  forms.map((form, index) => (
                    <motion.tr
                      key={`${form.formType}-${form.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
                      
                      <td className="p-3 text-sm text-slate-600">
                        {formatDateTimeInIsrael(form.created_date, 'dd/MM/yy HH:mm')}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs">
                          {form.formTypeLabel}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium text-slate-800 text-sm">
                        {form.owner_name || '-'}
                      </td>
                      <td className="p-3 text-slate-700 text-sm">
                        {form.pet_name || '-'}
                      </td>
                      <td className="p-3">
                        {getStatusBadge(form)}
                      </td>
                      <td className="p-3">
                        <Link to={getViewLink(form)}>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                            <Eye className="w-4 h-4 ml-1" />
                            צפייה
                          </Button>
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-3 px-4">
        {forms.length === 0 ? (
          <Card className="bg-white/90 p-6">
            <p className="text-center text-slate-500">אין טפסים להצגה</p>
          </Card>
        ) : (
          forms.map((form, index) => renderMobileFormCard(form, index))
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <PageHeader
            title="דשבורד"
            description="טוען נתונים..."
          />
          <StatsSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Custom responsive header for error state */}
          <div className="mb-4 md:mb-6 flex justify-between items-center">
              <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
                      דשבורד
                  </h1>
                  <p className="text-sm md:text-base text-slate-600">
                      שגיאה בטעינת הנתונים
                  </p>
              </div>
          </div>
          <ErrorMessage error={error} onRetry={loadDashboardData} />
        </div>
      </div>
    );
  }

  const statsData = [
    {
      title: "טפסי היכרות",
      description: "טפסים שהתקבלו מלקוחות חדשים",
      value: stats.totalIntakeForms,
      change: `+${stats.todayIntakeForms} היום`,
      icon: FileText,
      color: "bg-blue-500",
      link: "IntakeFormsList"
    },
    {
      title: "טפסי הסכמה",
      description: "טפסי הסכמה לניתוחים והליכים רפואיים",
      value: stats.totalConsentForms,
      change: `+${stats.todayConsentForms} היום`,
      icon: ClipboardCheck,
      color: "bg-purple-500",
      link: "ConsentForms"
    },
    {
      title: "בקשות תור",
      description: "תורים שמחכים לאישור ותיאום",
      value: stats.totalAppointments,
      icon: Calendar,
      color: "bg-green-500",
      link: "ManageAppointments"
    }
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsive */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            {currentUser?.role === "admin" ? "דשבורד ניהול מערכת" : "דשבורד"}
          </h1>
          <p className="text-sm md:text-base text-slate-600">
            {currentUser?.role === "admin"
              ? "מבט על כל המערכת והמרפאות"
              : `ברוך הבא, ${currentUser?.full_name || 'משתמש'}`}
          </p>
        </div>

        {/* Quick Actions - Responsive */}
        <Card className="mb-4 md:mb-6 bg-white/90 backdrop-blur-sm shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50 p-4">
            <CardTitle className="flex items-center gap-2 text-blue-900 text-lg">
              <TrendingUp className="w-5 h-5" />
              פעולות מהירות
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <Link to={createPageUrl("IntakeForm")} className="w-full">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-auto py-4 flex flex-col gap-2">
                  <FileText className="w-5 h-5" />
                  <span className="text-xs font-medium">טופס היכרות</span>
                </Button>
              </Link>

              <Link to={createPageUrl("CreateConsentForm")} className="w-full">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-auto py-4 flex flex-col gap-2">
                  <FileText className="w-5 h-5" />
                  <span className="text-xs font-medium">טופס הסכמה</span>
                </Button>
              </Link>

              <Link to={createPageUrl("ManageAppointments")} className="w-full">
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-auto py-4 flex flex-col gap-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-xs font-medium">ניהול תורים</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>



        {/* Forms Lists */}
        {currentUser?.role === "admin" ? (
          <>
            <div className="mb-4 px-4 md:px-0">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">טפסים אחרונים לפי מרפאה</h2>
              <p className="text-sm md:text-base text-slate-600">15 הטפסים האחרונים מכל מרפאה</p>
            </div>
            {clinics.map((clinic) => (
              <div key={clinic.id}>
                {renderFormsSection(formsByClinic[clinic.id] || [], clinic.name)}
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="mb-4 px-4 md:px-0">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">20 הטפסים האחרונים</h2>
              <p className="text-sm md:text-base text-slate-600">כל הטפסים שהוגשו לאחרונה במרפאה שלך</p>
            </div>
            {renderFormsSection(recentForms)}
          </>
        )}
      </div>
    </div>
  );
}