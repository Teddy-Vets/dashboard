import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  PawPrint,
  Calendar,
  Pill,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Stethoscope,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { formatDateInIsrael } from '@/components/utils/dateUtils';
import { validateLink } from '@/functions/validateLink';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function PublicSpayNeuterInstructionsPage() {
  const [instruction, setInstruction] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInstruction();
  }, []);

  const loadInstruction = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('t');

      if (!token) {
        throw new Error('קישור לא תקין - חסר מזהה');
      }

      const response = await validateLink({ t: token });

      if (!response.data?.valid) {
        throw new Error(response.data?.error || 'הקישור אינו תקף או פג תוקפו');
      }

      const { form, linkData } = response.data;

      if (linkData.form_type !== 'spay_neuter_instructions') {
        throw new Error('סוג הטופס אינו תואם');
      }

      setInstruction(form);

      // טעינת פרטי המרפאה
      if (form.clinic_id) {
        try {
          const { Clinic } = await import('@/entities/Clinic');
          const clinics = await Clinic.filter({ id: form.clinic_id });
          if (clinics && clinics.length > 0) {
            setClinic(clinics[0]);
          }
        } catch (e) {
          console.warn('Could not load clinic details:', e);
        }
      }

    } catch (error) {
      console.error('Error loading spay/neuter instructions:', error);
      setError(error.message || 'שגיאה בטעינת ההנחיות');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <LoadingSpinner size="xl" className="mx-auto mb-4" />
            <p className="text-slate-600">טוען הנחיות...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800">
                <p className="font-semibold mb-2">שגיאה בטעינת ההנחיות</p>
                <p className="text-sm">{error}</p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!instruction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                לא נמצאו הנחיות
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 shadow-xl">
          <CardHeader className="text-center border-b bg-gradient-to-r from-blue-50 to-teal-50">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                <PawPrint className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              הנחיות לאחר {instruction.surgery_type}
            </CardTitle>
            {clinic && (
              <p className="text-slate-600 mt-2">{clinic.name}</p>
            )}
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Heart className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-600">שם חיית המחמד</p>
                  <p className="font-semibold text-slate-800">{instruction.pet_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs text-slate-600">תאריך הניתוח</p>
                  <p className="font-semibold text-slate-800">
                    {formatDateInIsrael(instruction.surgery_date)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Sections */}
        
        {/* מנוחה והחלמה */}
        <Card className="bg-white/90 backdrop-blur-sm border-teal-100 shadow-lg">
          <CardHeader className="border-b bg-teal-50">
            <CardTitle className="flex items-center gap-2 text-teal-800">
              <Clock className="w-5 h-5" />
              מנוחה והחלמה
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {instruction.post_op_rest_instructions || 
                  'ביום הניתוח עם הגעתכם הביתה, יש לאפשר לבעל החיים מנוחה להן הוא זקוק, במקום חשוך ושקט. במהלך ההתאוששות ייתכנו צמרמורות ורעידות, ואף חולשה ברגליים וחוסר שליטה על צרכים - אלו תופעות נורמליות ויעברו כאשר השפעות ההרדמה יפוגו.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* האכלה */}
        {instruction.feeding_instructions && (
          <Card className="bg-white/90 backdrop-blur-sm border-orange-100 shadow-lg">
            <CardHeader className="border-b bg-orange-50">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Heart className="w-5 h-5" />
                הנחיות האכלה
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {instruction.feeding_instructions}
              </p>
            </CardContent>
          </Card>
        )}

        {/* טיפול תרופתי */}
        <Card className="bg-white/90 backdrop-blur-sm border-purple-100 shadow-lg">
          <CardHeader className="border-b bg-purple-50">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Pill className="w-5 h-5" />
              טיפול תרופתי
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {instruction.medication_instructions_general && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-slate-700 mb-2">הנחיות כלליות:</p>
                <p className="text-slate-700 whitespace-pre-wrap">{instruction.medication_instructions_general}</p>
              </div>
            )}

            {instruction.antibiotic_name && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-900 mb-2">אנטיביוטיקה</p>
                <div className="space-y-1 text-sm">
                  <p className="text-blue-800"><strong>שם:</strong> {instruction.antibiotic_name}</p>
                  {instruction.antibiotic_dosage && (
                    <p className="text-blue-800"><strong>מינון:</strong> {instruction.antibiotic_dosage}</p>
                  )}
                  {instruction.antibiotic_frequency && (
                    <p className="text-blue-800"><strong>תדירות:</strong> {instruction.antibiotic_frequency}</p>
                  )}
                </div>
              </div>
            )}

            {instruction.pain_medication_name && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="font-semibold text-green-900 mb-2">משכך כאבים</p>
                <div className="space-y-1 text-sm">
                  <p className="text-green-800"><strong>שם:</strong> {instruction.pain_medication_name}</p>
                  {instruction.pain_medication_dosage && (
                    <p className="text-green-800"><strong>מינון:</strong> {instruction.pain_medication_dosage}</p>
                  )}
                  {instruction.pain_medication_frequency && (
                    <p className="text-green-800"><strong>תדירות:</strong> {instruction.pain_medication_frequency}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* טיפול מקומי בחתך */}
        {instruction.local_wound_care_instructions && (
          <Card className="bg-white/90 backdrop-blur-sm border-red-100 shadow-lg">
            <CardHeader className="border-b bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Stethoscope className="w-5 h-5" />
                טיפול מקומי בחתך
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Alert className="border-amber-200 bg-amber-50 mb-4">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-sm">
                  <strong>חשוב:</strong> יש להקפיד על המלצות אלו למניעת זיהום
                </AlertDescription>
              </Alert>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {instruction.local_wound_care_instructions}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ציפיות והערות */}
        {instruction.post_op_expectations && (
          <Card className="bg-white/90 backdrop-blur-sm border-indigo-100 shadow-lg">
            <CardHeader className="border-b bg-indigo-50">
              <CardTitle className="flex items-center gap-2 text-indigo-800">
                <CheckCircle className="w-5 h-5" />
                מה לצפות לאחר הניתוח
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {instruction.post_op_expectations}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ביקורת */}
        {instruction.followup_date && (
          <Card className="bg-white/90 backdrop-blur-sm border-green-100 shadow-lg">
            <CardHeader className="border-b bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Calendar className="w-5 h-5" />
                ביקורת
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <Calendar className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm text-green-700">תאריך ביקורת מומלץ</p>
                  <p className="text-lg font-semibold text-green-900">
                    {formatDateInIsrael(instruction.followup_date)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* פרטי קשר */}
        {(clinic || instruction.veterinarian_name || instruction.clinic_contact_info || instruction.emergency_contacts) && (
          <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader className="border-b bg-slate-50">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Phone className="w-5 h-5" />
                פרטי יצירת קשר
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {clinic && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800">{clinic.name}</h4>
                  {clinic.phone && (
                    <a href={`tel:${clinic.phone}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                      <Phone className="w-4 h-4" />
                      {clinic.phone}
                    </a>
                  )}
                  {clinic.email && (
                    <a href={`mailto:${clinic.email}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                      <Mail className="w-4 h-4" />
                      {clinic.email}
                    </a>
                  )}
                  {clinic.address && (
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span>{clinic.address}</span>
                    </div>
                  )}
                </div>
              )}

              {instruction.veterinarian_name && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-slate-600">וטרינר מטפל</p>
                  <p className="font-semibold text-slate-800">{instruction.veterinarian_name}</p>
                </div>
              )}

              {instruction.clinic_contact_info && (
                <div className="pt-2 border-t">
                  <p className="text-slate-700 whitespace-pre-wrap">{instruction.clinic_contact_info}</p>
                </div>
              )}

              {instruction.emergency_contacts && instruction.emergency_contacts.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-semibold text-red-700 mb-2">מוקדים לחירום 24/7:</p>
                  {instruction.emergency_contacts.map((contact, index) => (
                    <div key={index} className="mb-2 p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="font-semibold text-red-900">{contact.name}</p>
                      {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="text-red-700 hover:text-red-800 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {contact.phone}
                        </a>
                      )}
                      {contact.address && (
                        <p className="text-sm text-red-600">{contact.address}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 py-4">
          <p>מערכת TeddyForms - מרפאות טדי וטס</p>
          <p className="mt-1">במקרה של שאלות או חששות, אנא פנו למרפאה</p>
        </div>
      </div>
    </div>
  );
}