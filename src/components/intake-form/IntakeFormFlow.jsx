import React, { useState, useEffect, useCallback } from "react";
import { IntakeForm, Client, Pet, User, Clinic } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Send, CheckCircle, Copy, Share2, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { createFormLink } from "@/functions/createFormLink";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { getEntityList, createEntity } from "@/components/utils/apiHelpers";
import { copyToClipboard, shareViaWhatsApp, shareViaEmail } from "@/components/utils/urlHelpers";
import userService from "@/components/services/userService";

export default function IntakeFormFlow({ onSuccess, clinicId, prefilledData = {} }) {
  const [formData, setFormData] = useState({
    clinicId: clinicId || '',
    ownerName: '',
    phone: '',
    email: '',
    petName: '',
    language: 'he',
    ...prefilledData
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [publicUrl, setPublicUrl] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserAndClinics = useCallback(async () => {
    try {
      const user = await userService.getCurrentUser();
      
      if (!user) {
        console.log('[IntakeFormFlow] User not authenticated, redirecting to login');
        await User.loginWithRedirect(window.location.href);
        return;
      }
      
      setCurrentUser(user);

      if (user.role === 'admin') {
        const allClinics = await getEntityList(Clinic, { is_active: true }, '-created_date', null, 'Clinic');
        setClinics(allClinics);
        if (!formData.clinicId && allClinics.length > 0) {
          setFormData(prev => ({ ...prev, clinicId: allClinics[0].id }));
        }
      } else if (user.clinic_id) {
        const userClinic = await getEntityList(Clinic, { id: user.clinic_id }, '-created_date', null, 'Clinic');
        setClinics(userClinic);
        setFormData(prev => ({ ...prev, clinicId: user.clinic_id }));
      }
    } catch (error) {
      console.error("Error loading user and clinics:", error);
      setError("שגיאה בטעינת פרטי המשתמש והמרפאות. אנא רענן את הדף ונסה שנית.");
    } finally {
      setIsLoading(false);
    }
  }, [formData.clinicId]);

  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      if (mounted) {
        await loadUserAndClinics();
      }
    };
    
    init();
    
    return () => {
      mounted = false;
    };
  }, []); // Run only once on mount

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!currentUser) {
        throw new Error("פרטי המשתמש לא נטענו. אנא רענן את הדף ונסה שנית.");
      }

      let targetClinicId = formData.clinicId;
      if (!targetClinicId) {
        targetClinicId = currentUser.clinic_id;
      }
      if (!targetClinicId) {
        if (currentUser.role === 'admin' && clinics.length > 0) {
          targetClinicId = clinics[0].id;
        } else {
          throw new Error("לא ניתן לקבוע את המרפאה המשויכת למשתמש.");
        }
      }

      // יצירת טופס היכרות טיוטה עם מינימום פרטים
      const intakeData = {
        owner_name: formData.ownerName || '',
        owner_phone: formData.phone || '',
        owner_email: formData.email || '',
        pet_name: formData.petName || '',
        clinic_id: targetClinicId,
        status: 'draft',
        staff_notes: `טופס נוצר ע"י ${currentUser.full_name} ונשלח ללקוח למילוי מלא`
      };

      const intakeForm = await createEntity(IntakeForm, intakeData, 'IntakeForm');

      // יצירת קישור מאובטח
      const linkResponse = await createFormLink({
        form_type: 'intake',
        clinic_id: targetClinicId,
        form_id: intakeForm.id,
        metadata: {
          owner_name: formData.ownerName,
          pet_name: formData.petName
        }
      });

      const token = linkResponse.data?.token;
      if (!token) {
        throw new Error("לא התקבל טוקן מהשרת.");
      }

      const url = `${window.location.origin}/PublicForm?t=${token}&lang=${formData.language}`;
      setPublicUrl(url);
      setShowSuccess(true);

    } catch (error) {
      console.error("Error creating intake form:", error);
      setError("אירעה שגיאה ביצירת הקישור: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(publicUrl);
      alert("הקישור הועתק! כעת אתם יכולים לשלוח אותו ללקוח בווטסאפ, מייל או SMS.");
    } catch (error) {
      console.error("Error copying link:", error);
      alert("שגיאה בהעתקת הקישור");
    }
  };

  const handleShareWhatsApp = () => {
    const messages = {
      he: `שלום ${formData.ownerName || ''},\nאנא מלאו את טופס ההיכרות למרפאת טדי וטס:`,
      en: `Hello ${formData.ownerName || ''},\nPlease fill out the intake form for Teddy Vets clinic:`,
      ru: `Здравствуйте ${formData.ownerName || ''},\nПожалуйста, заполните анкету для клиники Teddy Vets:`
    };
    
    const message = messages[formData.language] || messages.he;
    shareViaWhatsApp(publicUrl, message);
  };

  const handleShareEmail = () => {
    const subjects = {
      he: 'טופס היכרות למרפאת טדי וטס',
      en: 'Intake Form for Teddy Vets Clinic',
      ru: 'Анкета для клиники Teddy Vets'
    };
    
    const bodies = {
      he: `שלום ${formData.ownerName || ''},\n\nנא למלא את טופס ההיכרות בקישור הבא:\n\nתודה,\nצוות מרפאות טדי וטס`,
      en: `Hello ${formData.ownerName || ''},\n\nPlease fill out the intake form at the following link:\n\nThank you,\nTeddy Vets Team`,
      ru: `Здравствуйте ${formData.ownerName || ''},\n\nПожалуйста, заполните анкету по следующей ссылке:\n\nСпасибо,\nКоманда Teddy Vets`
    };
    
    const subject = subjects[formData.language] || subjects.he;
    const body = bodies[formData.language] || bodies.he;
    shareViaEmail(publicUrl, subject, body);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-slate-600">טוען...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <ErrorMessage error={error} onRetry={loadUserAndClinics} />
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-800 mb-2">הקישור נוצר בהצלחה!</h3>
                  <p className="text-green-700 mb-4">
                    נוצר קישור ציבורי מאובטח לטופס. שלחו את הקישור ללקוח כדי שיוכל למלא את כל הפרטים.
                  </p>

                  <div className="bg-white p-4 rounded border text-right">
                    <p className="text-sm text-slate-600 mb-2">קישור לשליחה ללקוח:</p>
                    <p className="text-sm font-mono bg-slate-100 p-2 rounded break-all">{publicUrl}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <Button onClick={handleCopyLink} variant="outline" className="w-full">
                    <Copy className="w-4 h-4 ml-2" />
                    העתק קישור
                  </Button>
                  <Button onClick={handleShareWhatsApp} className="w-full bg-green-600 hover:bg-green-700">
                    <Share2 className="w-4 h-4 ml-2" />
                    שלח בווטסאפ
                  </Button>
                  <Button onClick={handleShareEmail} variant="outline" className="w-full">
                    <Share2 className="w-4 h-4 ml-2" />
                    שלח במייל
                  </Button>
                </div>

                <div className="pt-6">
                  <Button onClick={onSuccess} className="bg-blue-600 hover:bg-blue-700">
                    חזור לדשבורד
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const canSubmit = formData.ownerName && formData.phone && formData.clinicId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687b78971cad562073ed5929/d7815950c_Yourparagraphtext1.png"
            alt="טדי וטס"
            className="mx-auto mb-4 w-64 h-auto object-contain"
          />
          <h1 className="text-3xl font-bold text-blue-900 mb-3">יצירת קישור לטופס היכרות</h1>
          <p className="text-slate-600">
            מלאו פרטים בסיסיים ויווצר קישור שתוכלו לשלוח ללקוח למילוי הטופס המלא
          </p>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="border-b border-blue-100">
            <CardTitle className="text-xl font-bold text-slate-800">פרטים בסיסיים</CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="p-8 space-y-6">
              {currentUser?.role === 'admin' && (
                <div>
                  <Label className="text-base font-medium text-slate-700">בחירת סניף המרפאה *</Label>
                  <Select 
                    value={formData.clinicId}
                    onValueChange={(value) => updateFormData('clinicId', value)}
                    disabled={clinics.length === 0}
                    dir="rtl"
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="בחר מרפאה" />
                    </SelectTrigger>
                    <SelectContent>
                      {clinics.map((clinic) => (
                        <SelectItem key={clinic.id} value={clinic.id}>{clinic.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label className="text-base font-medium text-slate-700">שם הבעלים *</Label>
                <Input 
                  value={formData.ownerName} 
                  onChange={(e) => updateFormData('ownerName', e.target.value)} 
                  className="mt-2" 
                  placeholder="הכניסו את שם הבעלים"
                  required 
                />
              </div>

              <div>
                <Label className="text-base font-medium text-slate-700">טלפון *</Label>
                <Input 
                  type="tel"
                  value={formData.phone} 
                  onChange={(e) => updateFormData('phone', e.target.value)} 
                  className="mt-2" 
                  placeholder="05X-XXXXXXX"
                  required 
                />
              </div>

              <div>
                <Label className="text-base font-medium text-slate-700">אימייל (אופציונלי)</Label>
                <Input 
                  type="email"
                  value={formData.email} 
                  onChange={(e) => updateFormData('email', e.target.value)} 
                  className="mt-2" 
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <Label className="text-base font-medium text-slate-700">שם חיית המחמד (אופציונלי)</Label>
                <Input 
                  value={formData.petName} 
                  onChange={(e) => updateFormData('petName', e.target.value)} 
                  className="mt-2" 
                  placeholder="שם החיה"
                />
              </div>

              <div>
                <Label className="text-base font-medium text-slate-700">שפת הטופס *</Label>
                <Select 
                  value={formData.language}
                  onValueChange={(value) => updateFormData('language', value)}
                  dir="rtl"
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="בחר שפה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="he">עברית</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ru">Русский</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>שימו לב:</strong> הלקוח ימלא את כל הפרטים בטופס הציבורי. 
                  הפרטים כאן משמשים רק ליצירת הקישור ולזיהוי הטופס.
                </p>
              </div>
            </CardContent>

            <div className="border-t border-blue-100 p-6 flex justify-end">
              <Button 
                type="submit" 
                disabled={!canSubmit || isSubmitting} 
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    יוצר קישור...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 ml-2" />
                    צור קישור ושלח ללקוח
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}