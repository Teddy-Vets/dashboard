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
              <h3 className="text-xl font-bold text-slate-700 mb-4">2. בחירת מסלול ותדירות תשלום</h3>

              {/* Plans Table */}
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-purple-100 text-purple-900">
                      <th className="border border-purple-200 px-3 py-2 text-right font-bold">מסלול</th>
                      <th className="border border-purple-200 px-3 py-2 text-right font-bold">תשלום חודשי בהו"ק</th>
                      <th className="border border-purple-200 px-3 py-2 text-right font-bold">תשלום שנתי מראש (כולל חודש מתנה)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { plan: 'teddy_basic', label: 'טדי בייסיק (כלבים)', monthly: '₪89 לחודש', annual: '₪82 לחודש (תשלום מראש לשנה)' },
                      { plan: 'teddy_plus', label: 'טדי פלוס (כלבים)', monthly: '₪129 לחודש', annual: '₪118 לחודש (תשלום מראש לשנה)' },
                      { plan: 'teddy_platinum', label: 'טדי פלטינום (כלבים)', monthly: '₪169 לחודש', annual: '₪155 לחודש (תשלום מראש לשנה)' },
                      { plan: 'teddy_royal', label: 'טדי רויאל (חתולים)', monthly: '₪79 לחודש', annual: '₪72 לחודש (תשלום מראש לשנה)' },
                      { plan: 'teddy_insured', label: 'טדי בטוח (לבעלי ביטוח פרטי)', monthly: '₪79 לחודש', annual: '₪72 לחודש (תשלום מראש לשנה)' },
                    ].map(row => (
                      <tr key={row.plan} className={form.selected_plan === row.plan ? 'bg-purple-50 font-bold' : 'bg-white'}>
                        <td className="border border-purple-100 px-3 py-2">
                          {form.selected_plan === row.plan && <span className="inline-block w-2 h-2 rounded-full bg-purple-500 ml-1 mb-0.5" />}
                          {row.label}
                        </td>
                        <td className="border border-purple-100 px-3 py-2">{row.monthly}</td>
                        <td className="border border-purple-100 px-3 py-2">{row.annual}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-white p-4 rounded-lg border border-purple-200 mb-4">
                <p className="font-bold text-purple-800 text-base">המסלול הנבחר: {PLAN_LABELS[form.selected_plan] || form.selected_plan || '-'}</p>
                <p className="text-slate-600 mt-1 text-sm">תשלום: <span className="font-semibold">{form.payment_frequency === 'annual' ? 'שנתי מראש (כולל חודש מתנה)' : 'הוראת קבע חודשית'}</span></p>
              </div>

              <div className="mt-2 text-sm text-slate-600 space-y-1 bg-yellow-50/50 p-3 rounded-lg border border-yellow-100">
                <p className="font-semibold text-slate-700 mb-1">הערות מחיר ותשלום:</p>
                <p>• תקופת המנוי הינה 12 חודשים.</p>
                <p>• מחירי המנויים עשויים להיות צמודים למדד ואינם כוללים אגרות ממשלתיות (לדוגמה: אגרת חיסון כלבת).</p>
                <p>• התשלום יבוצע בתשלום חד פעמי לשנה או הוראת קבע חודשית.</p>
                <p>• במקרה של כשל בגבייה תישלח התראה, ואם לא יבוצע תשלום בתוך 7 ימים ממועד ההתראה, הרשת רשאית להשעות או לבטל את המנוי.</p>
              </div>
            </div>

            {/* Part B – Full Terms */}
            <div className="bg-slate-50/60 p-6 rounded-xl border border-slate-200/60">
              <h3 className="text-xl font-bold text-slate-700 mb-1">חלק ב׳ – תנאי ההסכם</h3>
              <p className="text-xs text-slate-500 mb-5">(תנאי הצטרפות ושימוש בתוכנית המנויים)</p>

              <div className="space-y-5 text-sm text-slate-600">
                <div>
                  <p className="font-bold text-slate-800 mb-1">1. כללי</p>
                  <p>1.1 תקנון זה מסדיר את תנאי ההצטרפות, השימוש, הזכאות, הביטול, האחריות וההתחייבויות במסגרת תוכניות המנויים של רשת המרפאות הווטרינריות Teddy Vets.</p>
                  <p>1.2 התקנון מנוסח בלשון זכר מטעמי נוחות בלבד ומתייחס לכל המינים באופן שווה.</p>
                  <p>1.3 כל לקוח המצטרף לתוכנית מנויים מאשר כי קרא, הבין והסכים לכל תנאי התקנון.</p>
                  <p>1.4 במקרה של סתירה בין הוראות התקנון לבין פרסום שיווקי כלשהו – הוראות תקנון זה תגברנה.</p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-1">2. תוכניות המנויים</p>
                  <p>2.1 הרשת מציעה מספר תוכניות מנויים: טדי בייסיק, טדי פלוס, טדי פלטינום, טדי רויאל (לחתולים), טדי בטוח (לבעלי ביטוח פרטי).</p>
                  <p>2.2 כל תוכנית כוללת סל שירותים והטבות שונה, כפי שמפורט בפרסום העדכני באתר הרשת ובמרפאות.</p>
                  <p>2.3 השירותים עשויים לכלול: חיסונים שנתיים, טיפולים מונעים, בדיקות רפואיות, שירותי חירום, ייעוץ וטרינרי מרחוק, ניקוי שיניים, בדיקות סקר, טיפולים פיזיותרפיים, הטבות לרכישת מוצרים ועוד.</p>
                  <p>2.4 השירותים ניתנים לפי שיקול דעת רפואי ובהתאם להנחיות משרד החקלאות והרגולציה הרלוונטית.</p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-1">3. תקופת המנוי ותשלום</p>
                  <p>3.1 המנוי הינו לתקופה של 12 חודשים.</p>
                  <p>3.2 הלקוח יכול לבחור בין תשלום חודשי לבין תשלום שנתי מראש (הכולל חודש מתנה).</p>
                  <p>3.3 התשלום מתבצע באמצעות כרטיס אשראי תקף או הוראת קבע.</p>
                  <p>3.4 במקרה של כשל בגבייה – תישלח ללקוח התראה. אם לא יבוצע תשלום תוך 7 ימים, הרשת שומרת לעצמה את הזכות להשעות או לבטל את המנוי.</p>
                  <p>3.5 מחירי המנויים צמודים למדד ואינם כוללים אגרות ממשלתיות (לדוג' אגרת חיסון כלבת).</p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-1">4. זכאות והיקף הכיסוי</p>
                  <p>4.1 כל מנוי תקף עבור חיית מחמד אחת בלבד. לא ניתן להעביר את המנוי לבעלים או לחיה אחרת.</p>
                  <p>4.2 חיה אשר חלתה או טופלה טרם ההצטרפות – לא תהיה זכאית להחזר בגין טיפול רטרואקטיבי.</p>
                  <p>4.3 טיפולים כרוניים, אשפוזים, או מצבים הדורשים בדיקות מעבדה מתקדמות – יינתנו לפי התנאים וההנחות של כל מסלול.</p>
                  <p>4.4 טיפולים חיצוניים (אצל מומחים חיצוניים לרשת) אינם כלולים במנוי, אלא אם צוין אחרת.</p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-1">5. קבלת שירות והזמנת תורים</p>
                  <p>5.1 לקוח זכאי לקבל את השירותים הכלולים בתוכניתו במהלך תקופת המנוי בלבד.</p>
                  <p>5.2 יש לקבוע תור מראש לכל שירות – למעט מקרי חירום.</p>
                  <p>5.3 תורים יתואמו בהתאם לזמינות הצוות והמרפאה. אין התחייבות למועד מסוים למעט תוכניות הכוללות הבטחת תור.</p>
                  <p>5.4 שירותים שאינם מומשו בתקופת המנוי – לא יצברו לשנה הבאה ולא יינתן עבורם החזר.</p>
                  <p>5.5 תור שלא בוטל לפחות 4 שעות מראש – ייחשב כמומש.</p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-1">6. מימוש הטבות והנחות</p>
                  <p>6.1 ההטבות במסלול תקפות רק כל עוד המנוי פעיל ותשלומיו מעודכנים.</p>
                  <p>6.2 הנחות ברכישת מוצרים או טיפולים ניתנות במקום בלבד ואינן תקפות לאתר.</p>
                  <p>6.3 ניקוי שיניים ללא עלות (בטדי פלטינום) או בהנחה – יינתן אחת לשנה בלבד.</p>
                  <p>6.4 לא ניתן לצבור טיפולים שלא מומשו.</p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-1">7. ייעוץ מרחוק</p>
                  <p>7.1 שירות שיחה/וידאו עם וטרינר מחוץ לשעות הפעילות יינתן בהתאם למדיניות הרשת.</p>
                  <p>7.2 השירות אינו מהווה תחליף לבדיקה רפואית פיזית.</p>
                  <p>7.3 הרשת אינה מתחייבת למענה מיידי, אך תעשה מאמץ לתת מענה תוך זמן סביר.</p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-1">8. ביטול ושינוי מסלול</p>
                  <p>8.1 ניתן לבטל את המנוי בכל עת בהודעה בכתב לפחות 14 יום מראש.</p>
                  <p>8.2 במקרה של תשלום חודשי – יחויב הלקוח עד סוף החודש בו נמסרה הודעת הביטול.</p>
                  <p>8.3 במקרה של תשלום שנתי מראש – ייערך חישוב לפי חודשים מנוצלים, בניכוי חודש המתנה, והיתרה תוחזר.</p>
                  <p>8.4 שינוי מסלול (שדרוג או מעבר למסלול אחר) יתאפשר רק באישור הנהלת הרשת ובהתאם למדיניות.</p>
                </div>
              </div>

              {/* Cancellation Scenarios Table */}
              <div className="mt-6">
                <p className="font-bold text-slate-800 mb-3 text-sm">טבלת תרחישי ביטול:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-200 text-slate-800">
                        <th className="border border-slate-300 px-3 py-2 text-right font-bold">תרחיש</th>
                        <th className="border border-slate-300 px-3 py-2 text-right font-bold">הפעולה במערכת</th>
                        <th className="border border-slate-300 px-3 py-2 text-right font-bold">התחשבנות כספית</th>
                        <th className="border border-slate-300 px-3 py-2 text-right font-bold">המסר ללקוח</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white">
                        <td className="border border-slate-200 px-3 py-2 font-semibold">פטירת בעל החיים 🐾</td>
                        <td className="border border-slate-200 px-3 py-2">ביטול מנוי מיידי</td>
                        <td className="border border-slate-200 px-3 py-2"><strong>ספיגת חוב:</strong> לא גובים יתרה, גם אם ניצל שירותים רבים.</td>
                        <td className="border border-slate-200 px-3 py-2 text-slate-600">"משתתפים בצערכם, דאגנו לעצור את כל החיובים העתידיים. שלא תדעו צער."</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="border border-slate-200 px-3 py-2 font-semibold">מעבר דירה / מסירה 🏠</td>
                        <td className="border border-slate-200 px-3 py-2">ביטול בכפוף לגמר חשבון</td>
                        <td className="border border-slate-200 px-3 py-2"><strong>השוואת ערך:</strong> (שווי טיפולים) פחות (מה ששולם). הלקוח משלים את ההפרש.</td>
                        <td className="border border-slate-200 px-3 py-2 text-slate-600">"מכיוון שההנחות ניתנו על בסיס שנתי, אנו מחשבים את העלות היחסית וסוגרים את החשבון."</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="border border-slate-200 px-3 py-2 font-semibold">ביטול מרצון (סתם כי רוצה)</td>
                        <td className="border border-slate-200 px-3 py-2">ביטול בכפוף לגמר חשבון</td>
                        <td className="border border-slate-200 px-3 py-2"><strong>הזול מביניהם:</strong> הלקוח בוחר אם להשלים את ההפרש למחירון מלא, או לשלם את יתרת המנוי.</td>
                        <td className="border border-slate-200 px-3 py-2 text-slate-600">"המנוי הוא התחייבות שנתית שנותנת הנחות ענק. ניתן לבטל, אך אז ההנחות מתבטלות רטרואקטיבית."</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="border border-slate-200 px-3 py-2 font-semibold">חוסר שביעות רצון (תלונה)</td>
                        <td className="border border-slate-200 px-3 py-2">שיקול דעת מנהל</td>
                        <td className="border border-slate-200 px-3 py-2"><strong>גמיש:</strong> במקרה של כשל שירותי מובהק, נהוג לבטל ללא קנס.</td>
                        <td className="border border-slate-200 px-3 py-2 text-slate-600">"חשוב לנו שתצאו בהרגשה טובה. במקרה הזה נבוא לקראתכם ונבטל ללא חיוב נוסף."</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3 mt-6 text-sm text-slate-600">
                <div>
                  <p className="font-bold text-slate-800 mb-1">9. סיום חד-צדדי ע"י הרשת</p>
                  <p>9.1 הרשת שומרת לעצמה את הזכות להפסיק מנוי באופן חד-צדדי במקרה של: התנהגות פוגענית או מאיימת מצד הלקוח, אי עמידה בתנאי התשלום, ניצול לרעה של שירותי המנוי.</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800 mb-1">10. אחריות רפואית ומגבלות</p>
                  <p>10.1 כל שירות רפואי יבוצע ע"י צוות מקצועי מוסמך בהתאם לסטנדרטים הנהוגים ברשת.</p>
                  <p>10.2 המנוי אינו מבטיח מניעת מחלה או ריפוי מלא, אלא גישה זמינה, משתלמת ורציפה לשירותים וטרינריים.</p>
                  <p>10.3 השירותים ניתנים בהתאם לשיקול דעת רפואי בלבד, ואין לדרוש טיפול שאינו מאושר ע"י רופא.</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800 mb-1">11. הגנת פרטיות ודיוור</p>
                  <p>11.1 הצטרפות לתוכנית המנויים מהווה אישור להעברת דיוור שיווקי (לרבות SMS ודוא"ל) בנושאים הקשורים למנוי.</p>
                  <p>11.2 ניתן להסיר את ההרשאה בכל עת ע"י פניה לשירות הלקוחות.</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800 mb-1">12. שונות</p>
                  <p>12.1 הרשת רשאית לעדכן מעת לעת את תנאי התקנון, סל השירותים או המחירים, תוך מתן הודעה מראש של 30 יום למנויים הפעילים.</p>
                  <p>12.2 מובהר כי אין כפל מבצעים, הטבות או הנחות – למעט אם נאמר במפורש אחרת.</p>
                  <p>12.3 כל מחלוקת תידון בבתי המשפט המוסמכים בת"א בלבד.</p>
                </div>
              </div>
            </div>

            {/* Section 3 – Declarations */}
            <div className="bg-slate-50/60 p-6 rounded-xl border border-slate-200/60">
              <h3 className="text-xl font-bold text-slate-700 mb-4">3. הסכמות והצהרות</h3>

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