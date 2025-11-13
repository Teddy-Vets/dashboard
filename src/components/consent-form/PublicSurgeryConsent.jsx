import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Loader2, FileText, AlertCircle, DollarSign, Download } from "lucide-react";
import { submitConsentForm } from "@/functions/submitConsentForm";

export default function PublicSurgeryConsent({ linkData, token }) {
  const [formData, setFormData] = useState({
    ownerName: linkData?.metadata?.owner_name || '',
    ownerSignature: '',
    agreedToFinancial: false,
    confirmedAnesthesia: false,
    confirmedSurgicalRisks: false,
    confirmedPreOperativeTests: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const canvasRef = useRef(null);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      const signatureData = canvas.toDataURL();
      setFormData(prev => ({ ...prev, ownerSignature: signatureData }));
    }
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFormData(prev => ({ ...prev, ownerSignature: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreedToFinancial) {
      setSubmitError("יש לאשר את ההסכמה הכספית לפני המשך.");
      return;
    }

    if (!formData.confirmedAnesthesia || !formData.confirmedSurgicalRisks || !formData.confirmedPreOperativeTests) {
      setSubmitError("יש לאשר שקראת והבנת את כל הסעיפים לפני המשך.");
      return;
    }

    if (!formData.ownerSignature) {
      setSubmitError("אנא חתמו על הטופס לפני שליחה.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await submitConsentForm({
        token,
        signature_data: formData.ownerSignature,
        signature_verification_data: {
          browser_fingerprint: navigator.userAgent,
          screen_resolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          signature_duration: 0
        }
      });

      if (response.data?.success) {
        setSubmitSuccess(true);
      } else {
        throw new Error(response.data?.error || "שגיאה בשליחת הטופס");
      }
    } catch (error) {
      console.error("Error submitting consent:", error);
      setSubmitError(error.message || "אירעה שגיאה בשליחת הטופס. אנא נסו שנית.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-2xl w-full bg-white/90 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">הטופס נשלח בהצלחה!</h2>
            <p className="text-slate-600 text-lg">
              תודה רבה על חתימתכם. המרפאה קיבלה את הטופס וצוות הרפואי ייצור קשר בקרוב.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                אם יש לכם שאלות נוספות, אנא צרו קשר עם המרפאה.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const consentDetails = linkData?.form || linkData?.formData || {};

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687b78971cad562073ed5929/d7815950c_Yourparagraphtext1.png"
            alt="טדי וטס"
            className="mx-auto mb-6 w-64 h-auto object-contain"
          />
        </div>

        {/* Main Consent Form */}
        <Card className="bg-white shadow-md mb-6">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50/30 to-pink-50/30">
            <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-400" />
              טופס הסכמה מדעת להליך רפואי
            </CardTitle>
            <p className="text-slate-500 mt-2">
              אנו פועלים במלוא המקצועיות והמסירות כדי להבטיח את שלום ובריאות חיית המחמד שלכם.
            </p>
          </CardHeader>

          <CardContent className="p-6 md:p-8 space-y-8">
            {/* Patient Details */}
            <div className="bg-blue-50/30 p-6 rounded-xl border border-blue-100/50">
              <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                פרטי ההליך
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-slate-600">שם הבעלים:</span>
                  <span className="mr-2 text-slate-700">{consentDetails.owner_name || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-600">שם חיית המחמד:</span>
                  <span className="mr-2 text-slate-700">{consentDetails.pet_name || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-600">סוג ההליך:</span>
                  <span className="mr-2 text-slate-700">{consentDetails.procedure_type || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-600">תאריך מתוכנן:</span>
                  <span className="mr-2 text-slate-700">
                    {consentDetails.procedure_date 
                      ? new Date(consentDetails.procedure_date).toLocaleDateString('he-IL')
                      : '-'}
                  </span>
                </div>
              </div>
              
              {consentDetails.clinic_notes && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-blue-100/50">
                  <p className="font-semibold text-slate-600 mb-2">הערות מהמרפאה:</p>
                  <p className="text-slate-600 whitespace-pre-wrap">{consentDetails.clinic_notes}</p>
                </div>
              )}
            </div>

            {/* Anesthesia Information */}
            <div className="bg-green-50/30 p-6 rounded-xl border border-green-100/50">
              <h3 className="text-xl font-bold text-slate-700 mb-4">2. הרדמה כללית והסיכונים הכרוכים בה</h3>
              <div className="bg-white p-4 rounded-lg border border-green-100/50">
                <p className="text-slate-600 leading-relaxed">
                  אנו מבינים כי ההליך יבוצע בהרדמה כללית. הוסבר לנו כי הצוות הרפואי משתמש בחומרי הרדמה וניטור. עם זאת, אנו מודעים לכך שבכל הרדמה, בדומה לרפואת אדם, קיים סיכון מוגבר לסיבוכים, לרבות תגובה בלתי צפויה לחומרי ההרדמה, ובמקרים נדירים ביותר אף מוות.
                </p>
              </div>
              
              {/* Checkbox for Anesthesia */}
              <div className="mt-4 flex items-start space-x-3 space-x-reverse bg-blue-50/30 p-4 rounded-lg border border-blue-100/50">
                <Checkbox
                  id="confirm-anesthesia"
                  checked={formData.confirmedAnesthesia}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, confirmedAnesthesia: checked }))}
                  className="mt-1"
                />
                <Label htmlFor="confirm-anesthesia" className="text-sm text-slate-700 cursor-pointer leading-relaxed font-medium">
                  אני מאשר/ת שקראתי והבנתי את הסיכונים הכרוכים בהרדמה כללית <span className="text-red-500 font-bold">*</span>
                </Label>
              </div>
            </div>

            {/* Surgical Risks and Complications */}
            <div className="bg-orange-50/20 p-6 rounded-xl border border-orange-100/50">
              <h3 className="text-xl font-bold text-slate-700 mb-4">3. סיכונים וסיבוכים אפשריים בהליך הכירורגי</h3>
              
              <div className="bg-orange-50/40 p-4 rounded-lg border border-orange-100/50 mb-4">
                <p className="text-slate-600 leading-relaxed">
                  בנוסף לסיכונים הכרוכים בהרדמה, אנו מבינים כי לכל הליך כירורגי, פשוט או מורכב, ישנם סיכונים וסיבוכים אפשריים. הצוות הרפואי נוקט בכל האמצעים המקובלים כדי למזער סיכונים אלו, אך חשוב לנו להכיר בקיומם:
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <h4 className="font-bold text-slate-700 mb-2">סיבוכים במהלך או לאחר הניתוח:</h4>
                  <p className="text-slate-600 leading-relaxed">
                    אנו מודעים לאפשרות של סיכונים כגון דימום, זיהום בפצע הניתוח, תגובה לחומרי התפירה, פתיחה של התפרים, או היווצרות בקעים ופתיחה באזור המנותח.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <h4 className="font-bold text-slate-700 mb-2">תוצאות ההליך:</h4>
                  <p className="text-slate-600 leading-relaxed">
                    הוסבר לנו כי בעוד שהמטרה היא להשיג תוצאה רפואית מיטבית, הרפואה אינה מדע מדויק. ייתכנו מקרים בהם ההליך לא יישא את מלוא התוצאה המקווה (לדוגמה: המשך צליעה מסוימת לאחר ניתוח אורתופדי, חזרה של גידול שהוסר חלקית, או צורך בהליכים נוספים בעתיד).
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <h4 className="font-bold text-slate-700 mb-2">טיפול לאחר הניתוח:</h4>
                  <p className="text-slate-600 leading-relaxed">
                    אנו מבינים כי הצלחת הניתוח תלויה גם בטיפול שנעניק בבית לאחר השחרור, בהתאם להנחיות המדויקות שנקבל מהצוות הרפואי.
                  </p>
                </div>
              </div>
              
              {/* Checkbox for Surgical Risks */}
              <div className="mt-4 flex items-start space-x-3 space-x-reverse bg-blue-50/30 p-4 rounded-lg border border-blue-100/50">
                <Checkbox
                  id="confirm-surgical-risks"
                  checked={formData.confirmedSurgicalRisks}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, confirmedSurgicalRisks: checked }))}
                  className="mt-1"
                />
                <Label htmlFor="confirm-surgical-risks" className="text-sm text-slate-700 cursor-pointer leading-relaxed font-medium">
                  אני מאשר/ת שקראתי והבנתי את הסיכונים והסיבוכים האפשריים בהליך הכירורגי <span className="text-red-500 font-bold">*</span>
                </Label>
              </div>
            </div>

            {/* Pre-operative Tests and Preparations */}
            <div className="bg-indigo-50/20 p-6 rounded-xl border border-indigo-100/50">
              <h3 className="text-xl font-bold text-slate-700 mb-4">4. בדיקות והכנות מקדימות</h3>
              <div className="bg-white p-4 rounded-lg border border-indigo-100/50">
                <p className="text-slate-600 leading-relaxed mb-3">
                  <strong className="text-slate-700">בדיקות דם לפני הרדמה:</strong> אנו מסכימים לביצוע בדיקות דם לפני ההליך. ידוע לנו כי היקף הבדיקות מותאם אישית לגיל, לגזע ולמצב הרפואי של בעל החיים, וייתכן שיכלול פאנל בדיקות מורחב בהתאם להמלצת הצוות הרפואי.
                </p>
              </div>
              
              {/* Quote PDF Download - MOVED HERE */}
              {consentDetails.quote_pdf_url && (
                <div className="mt-4 bg-white p-4 rounded-lg border border-indigo-100/50">
                  <p className="text-slate-600 mb-3 font-semibold">
                    הצעת מחיר מפורטת
                  </p>
                  <p className="text-slate-600 text-sm mb-3">
                    המרפאה צירפה קובץ PDF עם הצעת מחיר מפורטת עבור ההליך
                  </p>
                  <a
                    href={consentDetails.quote_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    הורד הצעת מחיר PDF
                  </a>
                </div>
              )}
              
              {/* Checkbox for Pre-operative Tests */}
              <div className="mt-4 flex items-start space-x-3 space-x-reverse bg-blue-50/30 p-4 rounded-lg border border-blue-100/50">
                <Checkbox
                  id="confirm-preoperative"
                  checked={formData.confirmedPreOperativeTests}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, confirmedPreOperativeTests: checked }))}
                  className="mt-1"
                />
                <Label htmlFor="confirm-preoperative" className="text-sm text-slate-700 cursor-pointer leading-relaxed font-medium">
                  אני מאשר/ת שקראתי והבנתי את הצורך בבדיקות והכנות מקדימות <span className="text-red-500 font-bold">*</span>
                </Label>
              </div>
            </div>

            {/* Financial Agreement */}
            <div className="bg-yellow-50/30 p-6 rounded-xl border border-yellow-100/50">
              <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yellow-500" />
                5. הסכמה כספית
              </h3>
              
              <div className="bg-yellow-50/50 p-4 rounded-lg border border-yellow-100/50 mb-4">
                <p className="text-slate-600 leading-relaxed">
                  הוסברה לנו הערכת העלות להליך המתוכנן. אנו מבינים כי העלות עשויה להשתנות בהתאם לממצאים במהלך ההליך ולטיפולים נוספים שיידרשו.
                </p>
              </div>

              <div className="bg-blue-50/30 p-4 rounded-lg border border-blue-100/50">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <Checkbox
                    id="financial"
                    checked={formData.agreedToFinancial}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreedToFinancial: checked }))}
                    className="mt-1"
                  />
                  <Label htmlFor="financial" className="text-sm text-slate-700 cursor-pointer leading-relaxed font-medium">
                    אנו מתחייבים לשאת במלוא העלות של ההליך וכל הטיפולים הנלווים שיידרשו. <span className="text-red-500 font-bold">*</span>
                  </Label>
                </div>
              </div>
            </div>

            {/* Treatment Costs */}
            {consentDetails.treatment_costs && consentDetails.treatment_costs.length > 0 && (
              <div className="bg-yellow-50/30 p-6 rounded-xl border border-yellow-100/50">
                <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-yellow-500" />
                  הצעת מחיר
                </h3>
                <div className="space-y-3">
                  {consentDetails.treatment_costs.map((treatment, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100">
                      <span className="font-medium text-slate-700">{treatment.treatment_name}</span>
                      <span className="font-bold text-slate-800">₪{treatment.cost?.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200 mt-4">
                    <span className="text-lg font-bold text-gray-700">סה״כ:</span>
                    <span className="text-2xl font-bold text-green-600">₪{consentDetails.total_cost?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Signature Section */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50/30 p-6 rounded-xl border border-blue-100/50 space-y-4">
                <h3 className="text-xl font-bold text-slate-700">חתימה דיגיטלית</h3>
                
                {/* Consent Statement */}
                <div className="bg-white p-4 rounded-lg border border-blue-100/50">
                  <p className="text-slate-600 leading-relaxed">
                    אנו מאשרים כי קראנו והבנו את כל הפרטים הרפואיים והטיפוליים, ואנו מסכימים לבצע את ההליך המתואר לעיל. <span className="text-red-500 font-bold">*</span>
                  </p>
                </div>

                <div>
                  <Label htmlFor="owner-name" className="text-base font-medium text-slate-600 mb-2 block">
                    שם מלא *
                  </Label>
                  <Input
                    id="owner-name"
                    value={formData.ownerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                    placeholder="הכניסו את שמכם המלא"
                    required
                    className="bg-white"
                  />
                </div>

                <div>
                  <Label className="text-base font-medium text-slate-600 mb-2 block">
                    חתימה *
                  </Label>
                  <div className="border border-slate-200 rounded-lg bg-white p-2">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={200}
                      className="w-full touch-none"
                      style={{ touchAction: 'none', cursor: 'crosshair' }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearSignature}
                    className="mt-2 w-full md:w-auto"
                  >
                    נקה חתימה
                  </Button>
                </div>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700">{submitError}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !formData.confirmedAnesthesia || !formData.confirmedSurgicalRisks || !formData.confirmedPreOperativeTests || !formData.agreedToFinancial}
                className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    שולח טופס...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 ml-2" />
                    שלח טופס חתום
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}