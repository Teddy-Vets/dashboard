import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ConsentForm } from "@/entities/ConsentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label"; // Added Label import
import { ArrowRight, Calendar, User, Clock, Shield, CheckCircle, FileText, Printer } from "lucide-react"; // Updated lucide-react imports
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { getEntityById } from "@/components/utils/apiHelpers";
import { createPageUrl } from "@/components/utils/urlHelpers";

export default function ViewConsentFormPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const formId = searchParams.get("id");

  const [form, setForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (formId) {
      loadForm();
    } else {
      setError("מזהה טופס חסר");
      setIsLoading(false);
    }
  }, [formId]);

  const loadForm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = await getEntityById(ConsentForm, formId, 'ConsentForm');
      setForm(formData);
    } catch (err) {
      console.error("Error loading form:", err);
      setError(err.message || "שגיאה בטעינת הטופס");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <ErrorMessage error={error} onRetry={loadForm} />
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl("ConsentForms"))}
            className="mt-4"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            חזרה לרשימת טפסים
          </Button>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-600">טופס לא נמצא</p>
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl("ConsentForms"))}
            className="mt-4"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            חזרה לרשימת טפסים
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: { label: "ממתין לחתימה", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    signed: { label: "נחתם", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
    completed: { label: "הושלם", color: "bg-green-100 text-green-800", icon: FileText },
    legally_sealed: { label: "חתום משפטית", color: "bg-purple-100 text-purple-800", icon: Shield }
  };

  const config = statusConfig[form.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("ConsentForms"))}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-800">צפייה בטופס הכנה לניתוח</h1>
            <p className="text-slate-600 mt-1">מספר טופס: {form.id.substring(0, 8)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${config.color} border flex items-center gap-1`}>
              <StatusIcon className="w-4 h-4" />
              {config.label}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="flex items-center gap-1"
            >
              <Printer className="w-4 h-4" />
              הדפס
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">טופס הסכמה לניתוח</h2>
                <p className="text-purple-100">מרפאות טדי וטס</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* פרטי המטופל */}
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                פרטי המטופל
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-slate-600">
                <div>
                  <strong>שם הבעלים:</strong> {form.owner_name}
                </div>
                <div>
                  <strong>שם חיית המחמד:</strong> {form.pet_name}
                </div>
                <div>
                  <strong>סוג ההליך:</strong> {form.procedure_type}
                </div>
                <div>
                  <strong>תאריך ההליך:</strong>{" "}
                  {form.procedure_date ? format(new Date(form.procedure_date), "d MMMM yyyy", { locale: he }) : "לא צוין"}
                </div>
                {form.owner_email && (
                  <div>
                    <strong>אימייל:</strong> {form.owner_email}
                  </div>
                )}
                {form.owner_phone && (
                  <div>
                    <strong>טלפון:</strong> {form.owner_phone}
                  </div>
                )}
              </div>
            </div>

            {/* הנחיות מהמרפאה */}
            {form.clinic_notes && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-slate-800 mb-3">הנחיות מהמרפאה</h3>
                <p className="text-slate-700 whitespace-pre-wrap">{form.clinic_notes}</p>
              </div>
            )}

            {/* פרטי חתימה */}
            {(form.status === 'legally_sealed' || form.status === 'signed' || form.status === 'completed') && form.signature_data && (
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  טופס חתום
                </h3>

                <div className="space-y-4">
                  {/* החתימה */}
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">חתימה דיגיטלית:</Label>
                    <div className="text-2xl font-signature text-slate-800" style={{ fontFamily: 'cursive' }}>
                      {form.signature_data}
                    </div>
                  </div>

                  {/* מידע על החתימה */}
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {form.signed_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span>
                          <strong>נחתם ב:</strong>{" "}
                          {format(new Date(form.signed_at), "d MMMM yyyy, HH:mm", { locale: he })}
                        </span>
                      </div>
                    )}
                    {form.signature_ip && (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span>
                          <strong>IP:</strong> {form.signature_ip}
                        </span>
                      </div>
                    )}
                  </div>

                  {form.status === 'legally_sealed' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-purple-800">חתום משפטית</p>
                          <p className="text-sm text-purple-700 mt-1">
                            טופס זה אטום משפטית ואינו ניתן לשינוי. כל הפרטים נשמרים באופן מאובטח ומוצפן.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}