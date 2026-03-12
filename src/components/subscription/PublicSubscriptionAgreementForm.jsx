import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Loader2, FileText, AlertCircle, Shield } from "lucide-react";
import { submitSubscriptionAgreement } from "@/functions/submitSubscriptionAgreement";

const PLAN_LABELS = {
  teddy_basic: "טדי בייסיק (כלבים) - ₪89/חודש",
  teddy_plus: "טדי פלוס (כלבים) - ₪129/חודש",
  teddy_platinum: "טדי פלטינום (כלבים) - ₪169/חודש",
  teddy_royal: "טדי רויאל (חתולים) - ₪79/חודש",
  teddy_insured: "טדי בטוח (לבעלי ביטוח פרטי) - ₪79/חודש",
};

export default function PublicSubscriptionAgreementForm({ linkData, token }) {
  const form = linkData?.form || {};

  const [ownerName, setOwnerName] = useState(form.owner_name || '');
  const [confirmedTerms, setConfirmedTerms] = useState(false);
  const [confirmedPayment, setConfirmedPayment] = useState(false);
  const [confirmedMarketing, setConfirmedMarketing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState('');
  const canvasRef = useRef(null);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo((e.clientX || e.touches?.[0]?.clientX) - rect.left, (e.clientY || e.touches?.[0]?.clientY) - rect.top);
    setIsDrawing(true);
  };
  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo((e.clientX || e.touches?.[0]?.clientX) - rect.left, (e.clientY || e.touches?.[0]?.clientY) - rect.top);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke();
  };
  const stopDrawing = () => {
    if (isDrawing) setSignature(canvasRef.current.toDataURL());
    setIsDrawing(false);
  };
  const clearSignature = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setSignature('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirmedTerms || !confirmedPayment) {
      setSubmitError("יש לאשר את ההסכמות הנדרשות לפני שליחה.");
      return;
    }
    if (!signature) {
      setSubmitError("אנא חתמו על הטופס לפני שליחה.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await submitSubscriptionAgreement({
        token,
        signature_data: signature,
        signature_verification_data: {
          browser_fingerprint: navigator.userAgent,
          screen_resolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      });
      if (response.data?.success) {
        setSubmitSuccess(true);
      } else {
        throw new Error(response.data?.error || "שגיאה בשליחת הטופס");
      }
    } catch (err) {
      setSubmitError(err.message || "אירעה שגיאה. אנא נסו שנית.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-2xl w-full bg-white/90 shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">ההסכם נחתם בהצלחה!</h2>
            <p className="text-slate-600 text-lg">תודה רבה על הצטרפותכם לתוכנית המנויים. נציג המרפאה יצור קשר בקרוב.</p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">לשאלות נוספות, אנא צרו קשר עם המרפאה.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687b78971cad562073ed5929/d7815950c_Yourparagraphtext1.png" alt="טדי וטס" className="mx-auto mb-6 w-64 h-auto object-contain" />
        </div>

        <Card className="bg-white shadow-md mb-6">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50/30 to-pink-50/30">
            <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-400" />
              הסכם הצטרפות לתוכנית המנויים
            </CardTitle>
            <p className="text-slate-500 mt-2">רשת מרפאות Teddy Vets · גרסה 12/2025</p>
          </CardHeader>

          <CardContent className="p-6 md:p-8 space-y-8">

            {/* Section A – Parties */}
            <div className="bg-blue-50/30 p-6 rounded-xl border border-blue-100/50">
              <h3 className="text-xl font-bold text-slate-700 mb-4">חלק א׳ – פרטי ההסכם</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold text-slate-600">צד א׳ (הרשת):</span><span className="mr-2 text-slate-700">טדי וטס נכסים בע"מ / טדי וטס חולון בע"מ</span></div>
                <div><span className="font-semibold text-slate-600">צד ב׳ (הלקוח):</span><span className="mr-2 text-slate-700">{form.owner_name || '-'}</span></div>
                {form.owner_id_number && <div><span className="font-semibold text-slate-600">ת.ז.:</span><span className="mr-2 text-slate-700">{form.owner_id_number}</span></div>}
                {form.owner_phone && <div><span className="font-semibold text-slate-600">טלפון:</span><span className="mr-2 text-slate-700">{form.owner_phone}</span></div>}
                {form.owner_email && <div><span className="font-semibold text-slate-600">מייל:</span><span className="mr-2 text-slate-700">{form.owner_email}</span></div>}
                {form.owner_address && <div className="md:col-span-2"><span className="font-semibold text-slate-600">כתובת:</span><span className="mr-2 text-slate-700">{form.owner_address}</span></div>}
              </div>
            </div>

            {/* Pet Details */}
            <div className="bg-orange-50/20 p-6 rounded-xl border border-orange-100/50">
              <h3 className="text-xl font-bold text-slate-700 mb-4">1. פרטי חיית המחמד</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold text-slate-600">שם:</span><span className="mr-2 text-slate-700">{form.pet_name || '-'}</span></div>
                <div><span className="font-semibold text-slate-600">מין/סוג:</span><span className="mr-2 text-slate-700">{form.pet_type || '-'}</span></div>
                {form.pet_breed && <div><span className="font-semibold text-slate-600">גזע:</span><span className="mr-2 text-slate-700">{form.pet_breed}</span></div>}
                {form.pet_microchip && <div><span className="font-semibold text-slate-600">מספר שבב:</span><span className="mr-2 text-slate-700">{form.pet_microchip}</span></div>}
              </div>
            </div>

            {/* Plan */}
            <div className="bg-purple-50/30 p-6 rounded-xl border border-purple-100/50">
              <h3 className="text-xl font-bold text-slate-700 mb-4">2. המסלול הנבחר</h3>
              <div className="bg-white p-4 rounded-lg border border-purple-100">
                <p className="font-bold text-purple-800 text-lg">{PLAN_LABELS[form.selected_plan] || form.selected_plan || '-'}</p>
                <p className="text-slate-600 mt-1">תשלום: <span className="font-semibold">{form.payment_frequency === 'annual' ? 'שנתי מראש (כולל חודש מתנה)' : 'הוראת קבע חודשית'}</span></p>
              </div>
              <div className="mt-4 text-sm text-slate-600 space-y-1">
                <p>• תקופת המנוי הינה 12 חודשים.</p>
                <p>• מחירי המנויים עשויים להיות צמודים למדד ואינם כוללים אגרות ממשלתיות.</p>
                <p>• במקרה של כשל בגבייה תישלח התראה, ואם לא יבוצע תשלום תוך 7 ימים, הרשת רשאית להשעות או לבטל את המנוי.</p>
              </div>
            </div>

            {/* Terms - Section 3 */}
            <div className="bg-slate-50/60 p-6 rounded-xl border border-slate-200/60">
              <h3 className="text-xl font-bold text-slate-700 mb-4">3. הסכמות והצהרות</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <p>• <strong>הזכאות:</strong> כל מנוי תקף עבור חיית מחמד אחת בלבד. לא ניתן להעביר את המנוי לבעלים או לחיה אחרת.</p>
                <p>• <strong>ביטול:</strong> ניתן לבטל את המנוי בהודעה בכתב לפחות 14 יום מראש. שדרוג מסלול – באישור הנהלה בלבד.</p>
                <p>• <strong>שירותים:</strong> שירותים שלא מומשו בתקופת המנוי לא יצברו ולא יינתן עבורם החזר.</p>
                <p>• <strong>אחריות:</strong> המנוי אינו מבטיח מניעת מחלה, אלא גישה זמינה ומשתלמת לשירותים וטרינריים.</p>
                <p>• <strong>שינוי תנאים:</strong> הרשת רשאית לעדכן תנאי התקנון תוך הודעה מראש של 30 יום.</p>
                <p>• <strong>סמכות שיפוט:</strong> כל מחלוקת תידון בבתי המשפט בת"א בלבד.</p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3 bg-blue-50/40 p-4 rounded-lg border border-blue-100/50">
                  <Checkbox id="terms" checked={confirmedTerms} onCheckedChange={setConfirmedTerms} className="mt-1 flex-shrink-0" />
                  <Label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer leading-relaxed font-medium">
                    אני מאשר/ת כי קראתי והבנתי את תנאי הסכם זה ואת תקנון תוכנית המנויים (עודכן דצמבר 2025), וכי הם מהווים חלק בלתי נפרד מהסכם זה. כל הפרטים שמסרתי נכונים ומעודכנים. <span className="text-red-500 font-bold">*</span>
                  </Label>
                </div>
                <div className="flex items-start gap-3 bg-yellow-50/40 p-4 rounded-lg border border-yellow-100/50">
                  <Checkbox id="payment" checked={confirmedPayment} onCheckedChange={setConfirmedPayment} className="mt-1 flex-shrink-0" />
                  <Label htmlFor="payment" className="text-sm text-slate-700 cursor-pointer leading-relaxed font-medium">
                    אני מאשר/ת את הסדר התשלום הנבחר ומתחייב/ת לשאת בעלויות המנוי בהתאם לתנאים. <span className="text-red-500 font-bold">*</span>
                  </Label>
                </div>
                <div className="flex items-start gap-3 bg-green-50/40 p-4 rounded-lg border border-green-100/50">
                  <Checkbox id="marketing" checked={confirmedMarketing} onCheckedChange={setConfirmedMarketing} className="mt-1 flex-shrink-0" />
                  <Label htmlFor="marketing" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                    אני מאשר/ת קבלת הודעות שירות הקשורות למנוי (לרבות SMS/וואטסאפ/דוא"ל). ניתן לבטל בכל עת.
                  </Label>
                </div>
              </div>
            </div>

            {/* Section 4 – Signature */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50/30 p-6 rounded-xl border border-blue-100/50 space-y-4">
                <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-500" />
                  4. חתימה דיגיטלית
                </h3>
                <div className="bg-white p-4 rounded-lg border border-blue-100/50">
                  <p className="text-slate-600 leading-relaxed">
                    בחתימתי על הסכם זה, אני מאשר/ת את הצטרפותי לתוכנית המנויים של רשת Teddy Vets בהתאם לתנאים הנ"ל. <span className="text-red-500 font-bold">*</span>
                  </p>
                </div>
                <div>
                  <Label className="text-base font-medium text-slate-600 mb-2 block">שם מלא *</Label>
                  <Input value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="הכניסו את שמכם המלא" required className="bg-white" />
                </div>
                <div>
                  <Label className="text-base font-medium text-slate-600 mb-2 block">חתימה *</Label>
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
                  <Button type="button" variant="outline" onClick={clearSignature} className="mt-2 w-full md:w-auto">נקה חתימה</Button>
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
                disabled={isSubmitting || !confirmedTerms || !confirmedPayment}
                className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white text-lg py-6 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 ml-2 animate-spin" />שולח הסכם...</>
                ) : (
                  <><Check className="w-5 h-5 ml-2" />חתום ושלח הסכם</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}