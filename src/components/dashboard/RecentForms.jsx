
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Clock, CheckCircle, AlertCircle, User, Heart, Home } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusConfig = {
  // סטטוסים לטפסי היכרות
  submitted: {
    label: "נשלח",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock
  },
  reviewed: {
    label: "נבדק",
    color: "bg-blue-100 text-blue-800 border-blue-200", 
    icon: Eye
  },
  completed: {
    label: "הושלם",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle
  },
  // סטטוסים לטפסי הסכמה
  pending: {
    label: "ממתין לחתימה", 
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock
  },
  signed: {
    label: "נחתם",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle
  }
};

const visitReasonColors = {
  "בדיקה ראשונה וחיסונים לגור/ה": "bg-purple-100 text-purple-800",
  "חיסון שנתי": "bg-blue-100 text-blue-800",
  "בעיה רפואית": "bg-red-100 text-red-800",
  "ייעוץ (תזונה, התנהגות וכו')": "bg-green-100 text-green-800",
  "ביקורת": "bg-orange-100 text-orange-800",
  "אחר": "bg-gray-100 text-gray-800"
};

export default function RecentForms({ forms, consentForms, clients, pets, clinics, currentUser, isLoading }) {
  const navigate = useNavigate();

  const getClinicName = (clinicId) => {
    if (!clinics) return "לא זמין";
    const clinic = clinics.find(c => c.id === clinicId);
    return clinic?.name || "לא משויך";
  };

  // איחוד הטפסים משני הסוגים
  const getCombinedForms = () => {
    const intakeForms = (forms || []).map(form => ({
      ...form,
      type: 'intake',
      ownerName: getClientName(form.client_id),
      petName: getPetName(form.pet_id),
      displayTitle: form.visit_reason_main || "טופס היכרות", // Changed from "טופס קליטה"
      clinicName: getClinicName(form.clinic_id)
    }));

    const consent = (consentForms || []).map(form => ({
      ...form,
      type: 'consent',
      ownerName: form.owner_name,
      petName: form.pet_name,
      displayTitle: form.procedure_type || "טופס הסכמה",
      clinicName: getClinicName(form.clinic_id)
    }));

    // איחוד ומיון לפי תאריך יצירה
    const combined = [...intakeForms, ...consent];
    return combined
      .filter(form => form.created_date) // רק טפסים עם תאריך יצירה
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 10); // 10 האחרונים
  };

  const getClientName = (clientId) => {
    const client = (clients || []).find(c => c.id === clientId);
    return client?.owner_name || "לא זמין";
  };

  const getPetName = (petId) => {
    const pet = (pets || []).find(p => p.id === petId);
    return pet?.pet_name || "לא זמין";
  };

  const combinedForms = getCombinedForms();
  const isAdmin = currentUser?.role === 'admin';

  const handleViewClick = (form) => {
    if (form.type === 'intake') {
      navigate(createPageUrl(`ViewIntakeForm?id=${form.id}`));
    } else if (form.type === 'consent') {
      navigate(createPageUrl(`PublicConsentForm?id=${form.id}`));
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg overflow-hidden">
      <CardHeader className="pb-4 border-b border-blue-100">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" />
            טפסים אחרונים
          </CardTitle>
          <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
            הצג הכל
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 overflow-hidden">
        <div 
          className="overflow-x-auto overflow-y-hidden"
          style={{ 
            maxWidth: '100%',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <Table 
            className="min-w-[900px] w-full"
            style={{ minWidth: '900px' }}
          >
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-right whitespace-nowrap">סוג טופס</TableHead>
                <TableHead className="text-right whitespace-nowrap">בעלים</TableHead>
                <TableHead className="text-right whitespace-nowrap">חיית מחמד</TableHead>
                {isAdmin && <TableHead className="text-right whitespace-nowrap">מרפאה</TableHead>}
                <TableHead className="text-right whitespace-nowrap">פרטים</TableHead>
                <TableHead className="text-right whitespace-nowrap">תאריך</TableHead>
                <TableHead className="text-right whitespace-nowrap">סטטוס</TableHead>
                <TableHead className="text-right whitespace-nowrap">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="whitespace-nowrap"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="whitespace-nowrap"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="whitespace-nowrap"><Skeleton className="h-4 w-20" /></TableCell>
                      {isAdmin && <TableCell className="whitespace-nowrap"><Skeleton className="h-4 w-24" /></TableCell>}
                      <TableCell className="whitespace-nowrap"><Skeleton className="h-6 w-32 rounded-full" /></TableCell>
                      <TableCell className="whitespace-nowrap"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="whitespace-nowrap"><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell className="whitespace-nowrap"><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : combinedForms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-8 text-slate-500">
                      אין טפסים להצגה
                    </TableCell>
                  </TableRow>
                ) : (
                  combinedForms.map((form, index) => (
                    <motion.tr
                      key={`${form.type}-${form.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-blue-50/50 transition-colors duration-200"
                    >
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {form.type === 'intake' ? (
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium text-blue-700">היכרות</span> {/* Changed from "קליטה" */}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4 text-purple-500" />
                              <span className="text-sm font-medium text-purple-700">הכנה לניתוח</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {form.ownerName?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span className="font-medium text-slate-800">
                            {form.ownerName || "לא זמין"}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="whitespace-nowrap">
                        <span className="font-medium text-slate-700">
                          {form.petName || "לא זמין"}
                        </span>
                      </TableCell>

                      {isAdmin && (
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Home className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-700">{form.clinicName}</span>
                          </div>
                        </TableCell>
                      )}
                      
                      <TableCell className="whitespace-nowrap">
                        <Badge 
                          variant="secondary"
                          className={`${
                            form.type === 'intake' 
                              ? visitReasonColors[form.visit_reason_main] || visitReasonColors["אחר"]
                              : "bg-purple-100 text-purple-800"
                          } border text-xs`}
                        >
                          {form.displayTitle}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="whitespace-nowrap">
                        <span className="text-sm text-slate-600">
                          {form.created_date ? format(new Date(form.created_date), "d MMM, HH:mm", { locale: he }) : "לא זמין"}
                        </span>
                      </TableCell>
                      
                      <TableCell className="whitespace-nowrap">
                        {(() => {
                          const config = statusConfig[form.status] || statusConfig.submitted;
                          const StatusIcon = config.icon;
                          return (
                            <Badge 
                              variant="secondary"
                              className={`${config.color} border flex items-center gap-1 w-fit`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {config.label}
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      
                      <TableCell className="whitespace-nowrap">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => handleViewClick(form)}
                        >
                          <Eye className="w-4 h-4 ml-1" />
                          צפייה
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
