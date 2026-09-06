import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Loader2, FileText, AlertCircle, Shield } from "lucide-react";
import { submitSubscriptionAgreement } from "@/functions/submitSubscriptionAgreement";

const PLAN_LABELS = {
  teddy_basic: "טדי בייסיק",
  teddy_plus: "טדי פלוס",
  teddy_platinum: "טדי פלטינום",
  teddy_royal: "טדי רויאל",
  teddy_insured: "טדי בטוח",
};

export default function PublicSubscriptionAgreementForm({ linkData, token }) {
  const form = linkData?.form || {};

  const [ownerName, setOwnerName] = useState(form.owner_name || '');
  const [confirmedRead, setConfirmedRead] = useState(false);
  const [confirmedServices, setConfirmedServices] = useState(false);
  const [confirmedPayment, setConfirmedPayment] = useState(false);
  const [confirmedRenewal, setConfirmedRenewal] = useState(false);
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
    if (!confirmedRead || !confirmedServices || !confirmedPayment || !confirmedRenewal) {
      setSubmitError("יש לאשר את כל ההסכמות הנדרשות (המסומנות בכוכבית) לפני שליחה.");
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
        agreed_to_marketing: confirmedMarketing,
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
            <p className="text-slate-600 text-lg">תודה רבה על הצטרפותכם לתוכנית הבריאות. נציג המרפאה יצור קשר בקרוב.</p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">לשאלות נוספות, אנא צרו קשר עם המרפאה.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const paymentFrequencyLabel = form.payment_frequency === 'annual'
    ? 'חיוב שנתי מראש (חד-פעמי)'
    : form.payment_frequency === 'annual_recurring'
      ? 'חיוב שנתי מתחדש'
      : 'חיוב חודשי מתחדש';

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687b78971cad562073ed5929/d7815950c_Yourparagraphtext1.png"
            alt="טדי וטס"
            className="mx-auto mb-6 w-64 h-auto object-contain"
          />
        </div>

        <Card className="bg-white shadow-md mb-6">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50/30 to-pink-50/30">
            <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-400" />
              הסכם הצטרפות לתוכניות הבריאות Teddy Health Plans
            </CardTitle>
            <p className="text-slate-500 mt-2 text-sm">
              הסכם זה נערך בין החברה המפעילה את המרפאה בה בוצעה ההצטרפות, כחלק מרשת Teddy Vets, לבין הלקוח שפרטיו מפורטים בהסכם זה.
            </p>
          </CardHeader>

          <CardContent className="p-6 md:p-8 space-y-8">

            {/* חלק א׳ – פרטי ההצטרפות */}
            <div className="bg-blue-50/30 p-6 rounded-xl border border-blue-100/50">
              <h3 className="text-xl font-bold text-slate-700 mb-5 pb-2 border-b border-blue-100">חלק א׳ – פרטי ההצטרפות</h3>

              {/* פרטי הלקוח */}
              <div className="mb-6">
                <h4 className="font-bold text-slate-700 mb-3 text-base">פרטי הלקוח</h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="flex gap-2">
                    <span className="font-semibold text-slate-600 min-w-fit">שם החברה המתקשרת / ח.פ.:</span>
                    <span className="text-slate-700">טדי וטס נכסים בע"מ / טדי וטס חולון בע"מ</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-slate-600 min-w-fit">מרפאת ההצטרפות:</span>
                    <span className="text-slate-700">{form.clinic_name || '-'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-slate-600 min-w-fit">שם הלקוח:</span>
                    <span className="text-slate-700">{form.owner_name || '-'}</span>
                  </div>
                  {form.owner_id_number && (
                    <div className="flex gap-2">
                      <span className="font-semibold text-slate-600 min-w-fit">ז״ת:</span>
                      <span className="text-slate-700">{form.owner_id_number}</span>
                    </div>
                  )}
                  {form.owner_phone && (
                    <div className="flex gap-2">
                      <span className="font-semibold text-slate-600 min-w-fit">טלפון:</span>
                      <span className="text-slate-700">{form.owner_phone}</span>
                    </div>
                  )}
                  {form.owner_email && (
                    <div className="flex gap-2">
                      <span className="font-semibold text-slate-600 min-w-fit">דוא״ל:</span>
                      <span className="text-slate-700">{form.owner_email}</span>
                    </div>
                  )}
                  {form.owner_address && (
                    <div className="flex gap-2 md:col-span-2">
                      <span className="font-semibold text-slate-600 min-w-fit">כתובת:</span>
                      <span className="text-slate-700">{form.owner_address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* פרטי חיית המחמד */}
              <div className="mb-6">
                <h4 className="font-bold text-slate-700 mb-3 text-base">פרטי חיית המחמד</h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm bg-white p-4 rounded-lg border border-blue-100">
                  <div className="flex gap-2">
                    <span className="font-semibold text-slate-600 min-w-fit">שם:</span>
                    <span className="text-slate-700">{form.pet_name || '-'}</span>
                  </div>
                  {form.pet_microchip && (
                    <div className="flex gap-2">
                      <span className="font-semibold text-slate-600 min-w-fit">מספר שבב:</span>
                      <span className="text-slate-700">{form.pet_microchip}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <span className="font-semibold text-slate-600 min-w-fit">סוג:</span>
                    <span className="text-slate-700">{form.pet_type || '-'}</span>
                  </div>
                  {form.pet_breed && (
                    <div className="flex gap-2">
                      <span className="font-semibold text-slate-600 min-w-fit">גזע:</span>
                      <span className="text-slate-700">{form.pet_breed}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* פרטי המנוי */}
              <div>
                <h4 className="font-bold text-slate-700 mb-3 text-base">פרטי המנוי</h4>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-sm space-y-2">
                  <div className="flex gap-2">
                    <span className="font-bold text-purple-800 min-w-fit">המסלול שנבחר:</span>
                    <span className="font-bold text-purple-900">{PLAN_LABELS[form.selected_plan] || form.selected_plan || '-'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-slate-600 min-w-fit">אופן התשלום:</span>
                    <span className="text-slate-700">{paymentFrequencyLabel}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-purple-100">
                    * פירוט השירותים וההטבות של המסלול שנבחר, כפי שנמסר ללקוח במועד ההצטרפות, מצורף להסכם זה כנספח א׳ ומהווה חלק בלתי נפרד ממנו.
                  </p>
                </div>
              </div>
            </div>

            {/* חלק ב׳ – תנאי ההתקשרות */}
            <div className="bg-slate-50/60 p-6 rounded-xl border border-slate-200/60">
              <h3 className="text-xl font-bold text-slate-700 mb-1">חלק ב׳ – תנאי ההתקשרות</h3>

              <div className="space-y-5 text-sm text-slate-600">

                <div>
                  <p className="font-bold text-slate-800 mb-2">1. מטרת ההסכם ומסמכי ההתקשרות</p>
                  <p className="mb-1">1.1 החברה מפעילה תוכניות בריאות לחיות מחמד הכוללות שירותים, הטבות והנחות בהתאם למסלול שנבחר.</p>
                  <p className="mb-1">1.2 הסכם זה, נספח א׳, תקנון תוכנית המנויים ומדיניות הפרטיות של הרשת מהווים יחד את מסמכי ההתקשרות. במקרה של סתירה ביחס למחיר או להטבה ספציפית שנמסרו ללקוח במועד ההצטרפות, יגברו הפרטים המפורשים שנרשמו בהסכם זה ובנספח א׳, בכפוף לכל דין.</p>
                  <p>1.3 הלקוח מאשר כי לפני ההצטרפות קיבל אפשרות לעיין בפירוט המסלול, בתקנון המנויים ובמדיניות הפרטיות, וכי נמסר לו מידע מהותי בדבר תקופת המנוי, המחיר, אופן התשלום, השירותים, ההחרגות ודרכי הביטול.</p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-2">2. השירותים והיקף הזכאות</p>
                  <p className="mb-1">2.1 החברה תעניק לחיית המחמד את השירותים וההטבות הכלולים במסלול שנבחר ובכפוף לתנאיו. שירות או הטבה שלא נכללו במפורש במסלול אינם כלולים במנוי.</p>
                  <p className="mb-1">2.2 כל החלטה רפואית תתקבל על ידי וטרינר/ית מטפל/ת לפי לשיקול דעת מקצועי, מצבה הרפואי של חיית המחמד והדין החל. המנוי אינו מקנה זכות לדרוש טיפול שאינו נדרש או שאינו מאושר רפואית.</p>
                  <p className="mb-1">2.3 תוכנית המנוי אינה פוליסת ביטוח ואינה מבטיחה מניעת מחלה, ריפוי מלא, מימון של כל טיפול רפואי או כיסוי של שירותים שאינם כלולים במסלול.</p>
                  <p className="mb-1">2.4 המנוי אישי לחיית המחמד הרשומה בלבד ואינו ניתן להעברה לחיית מחמד אחרת או לבעלים אחר, אלא באישור החברה מראש ובכתב.</p>
                  <p className="mb-1">2.5 המנוי אינו מזכה בהחזר רטרואקטיבי בגין טיפול או שירות שניתן לפני מועד תחילתו. טיפולים חיצוניים לרשת אינם כלולים, אלא אם צוין במפורש אחרת במסלול.</p>
                  <p>2.6 המנוי תקף בכל סניפי Teddy Vets, בהתאם לזמינות התורים, כוח האדם, הציוד והשירותים בכל מרפאה.</p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-2">3. קבלת שירות, תורים ומימוש הטבות</p>
                  <p className="mb-1">3.1 יש לקבוע תור מראש לכל שירות, למעט מקרה חירום שבו יש לפעול בהתאם להנחיות המרפאה. זמני התור המובטחים, ככל שקיימים במסלול, מתייחסים לזמינות בהתאם לתנאי המסלול ולשעות פעילות המרפאות.</p>
                  <p className="mb-1">3.2 תור שלא בוטל תוחפות 4 שעות מראש רשאי להיחשב כתור שמומש, ככל שהדבר רלוונטי לסכמת השירות במסלול.</p>
                  <p className="mb-1">3.3 שירותים והטבות שלא מומשו בתקופת המנוי אינם נצברים לתקופה הבאה, אינם ניתנים להעברה ואינם ניתנים להמרה בכסף, אלא אם נאמר במפורש אחרת.</p>
                  <p>3.4 הנחות והטבות חלות כל עוד המנוי פעיל והתשלומים עבורו מעודכנים, ואין כפל מבצעים או הנחות אלא אם צוין במפורש אחרת.</p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-2">4. הצהרות והתחייבויות הלקוח</p>
                  <p className="mb-1">4.1 הלקוח מצהיר כי כל הפרטים שמסר נכונים, מלאים ומעודכנים, ומתחייב לעדכן את החברה ללא איחוב בכל שינוי מהותי, לרבות שינוי בעלות, פרטי התקשרות או פטירת חיית המחמד.</p>
                  <p className="mb-1">4.2 מסירת מידע כוזב או מהותי באופן חסר עלולה למנוע מתן שירות או להביא לסיום המנוי, בכפוף לדין ולנסיבות העניין.</p>
                  <p>4.3 הלקוח מתחייב לנהוג בכבוד כלפי צוות המרפאות ולא לעשות שימוש לרעה במנוי, לרבות קביעת תורים פיקטיביים, שימוש מסחרי או ניסיון להעביר את המנוי לאחר.</p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-2">5. תקופת המנוי, תשלום וחידוש</p>
                  <p className="mb-1">5.1 המנוי הינו מנוי מתחדש באופן חודשי/שנתי ללא הגבלה של זמן (להרחבה ראה נספח ב), או מנוי בתשלום שנתי מראש מוגבל לשנה (להרחבה ראה נספח ג).</p>
                  <p className="mb-1">5.2 במסלול מתחדש יבוצע חיוב חודשי/שנתי בהתאם לבחירת הלקוח. במסלול שנתי יבוצע חיוב אחד מראש עבור תקופת המנוי, בהתאם למחיר שנרשם בחלק א׳. ככל שניתנה הטבת חודש ללא עלות בתשלום שנתי, היא מחושבת במחיר השנתי שנרשם.</p>
                  <p className="mb-1">5.3 הלקוח מאשר לחברה לחייב את אמצעי התשלום שמסר בהתאם למסלול שנבחר. אי-כיבוד חיוב אינו מהווה הודעת ביטול.</p>
                  <p className="mb-1">5.4 במקרה של כשל בגבייה החברה רשאית, לאחר מתן התראה ובכפוף לדין, להשעות את המנוי עד לסדרת החוב. שירותים שניתנו בתקופת ההשעיה עשויים להיות מחויבים במחיר מלא.</p>
                  <p>5.5 חידוש המנוי לאחר מות התקופה הראשונה ייעשה רק בהתאם למנגנון החידוש שנמסר ללקוח ובכפוף להוראות הדין. מחיר החידוש יהיה המחיר הקפה במועד החידוש, אלא אם נמסרה ללקוח הודעה כנדרש בדין.</p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-2">6. ביטול וסיום מוקדם</p>
                  <p className="mb-1">6.1 בקשת ביטול המנוי תימסר בהודעה בכתב למרפאה שבה מנוהל המנוי, באמצעות אמצעי התקשרות בכתב שהמרפאה מעמידה לרשות לקוחותיה. לעמן הסר ספק, אין בהוראה זו כדי לגרוע מזכות הלקוח למסור הודעת ביטול בדרך נוספת שהחברה מחויבת לאפשר לפי דין.</p>
                  <p className="mb-1">6.2 עם ביטול המנוי תיערך התחשבנות בגין תקופת המנוי הנוכחית בדרך של קיזוז בין שווי השירותים וההטבות שנוצלו בפועל עד למועד הביטול לבין הסכומים שנשלמו בפועל. שווי השירותים וההטבות שנוצלו יחושב לפי המחירון המלא שהיה בתוקף במועד קבלתם, ובניכוי כל סכום ששולם עבורם. ככל שלאחר הקיזוז תיוותר יתרה לחובת הלקוח, הלקוח ישלים את ההפרש; ככל שתיוותר יתרה לזכות הלקוח, היא תושב לו, והכול בכפוף להוראות הדין.</p>
                  <p className="mb-1">6.3 במקרה של פטירת חיית המחמד, המנוי יבוטל באופן מיידי עם מסירת הודעה למרפאה, ללא התחשבנות או חיוב נוסף לפי סעיף 6.2. החברה רשאית לבקש אסמכתא הסבירה לפטירה, מבלי לעכב בשל כך את עצם הביטול.</p>
                  <p className="mb-1">6.4 במקרה של כשל שירותי קהבומ או נסיבות חריגות אחרות, החברה רשאית לוותר, כולו או חלקו, על סכום גמר החשבון, לפי שיקול דעת סביר ובכפוף לדין.</p>
                  <p>6.5 אין באמור בסעיף זה כדי לגרוע מזכויות ביטול, השבה או תרופות אחרות הנקוות ללקוח לפי הוראות דין קוגנטי.</p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-2">7. סיום המנוי על ידי החברה</p>
                  <p className="mb-1">7.1 החברה רשאית להשעות או לסיים את המנוי, לאחר התראה ככל שהנסיבות מאפשרות, במקרה של אי-תשלום, מסירת מידע כוזב מהותי, שימוש לרעה בתוכנית, הפרה יסודית של ההסכם או התנהגות אלימה, מאיימת, גסה או פוגענית כלפי צוות המרפאה.</p>
                  <p>7.2 סיום על ידי החברה לא יגרע מזכות הלקוח לקבלת החזר בגין סכומים ששולמו מראש עבור תקופה שלא אסופקה, ככל שמגיע החזר לפי דין ובכפוף לקיזוז סכומים שהלקוח חייב כדין.</p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-2">8. פרטיות, תיק רפואי והודעות</p>
                  <p className="mb-1">8.1 החברה תשמור ותעבד מידע אישי ומידע הנוגע לחיית המחמד לצורך ניהול המנוי, מתן שירותים רפואיים, ניהול התיק הרפואי, גבייה, שירות לקוחות, אבטחה ועמידה בדרישות דין, בהתאם למדיניות הפרטיות של Teddy Vets ולהוראות הדין.</p>
                  <p className="mb-1">8.2 לצורך רצף טיפולי, סניפי הרשת יהיו רשאים לעיין ולעדכן את התיק הרפואי של חיית המחמד בהתאם לאישרויות ולמדיניות החברה.</p>
                  <p>8.3 הלקוח מסכים לקבל הודעות שירות ותזכורות הנחוצות לניהול המנוי והטיפול, באמצעי הקשר שמסר. הסכמה לקבלת דברי פרסומת, ככל שתינתן, היא נפרדת ואינה תנאי להצטרפות למנוי.</p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-2">9. שונות</p>
                  <p className="mb-1">9.1 החברה רשאית לעדכן את מחיר המנוי לתקופת חידוש עתידית וכן לעדכן את סל השירותים לתקופות עתידיות, בכפוף להודעה מראש ולהוראות הדין. שינוי במהלך תקופת מנוי פעילה לא יגרע מהטבות שכבר הוקנו ללקוח לפי הסכם זה ונספחיו, אלא אם הדין מאפשר אחרת או שהשינוי מיטיב עם הלקוח.</p>
                  <p className="mb-1">9.2 החברה לא תיחשב כמפרה התחייבות אם אי-מתן שירות נגרם בעקבות נסיבות שאינן בשליטתה הסבירה, לרבות מצב חירום, מלחמה, מגפה, שביתה, הנחיית רשות מוסמכת או כוח עליון, ובלבד שתפעל ככל שניתן לצמצום הפגיעה בשירות.</p>
                  <p className="mb-1">9.3 על הסכם זה יחולו דיני מדינת ישראל. סמכות השיפוט תיקבע בהתאם להוראות הדין ואין באמור בהסכם כדי לגרוע מסמכות מקומית קוגנטית הנקומה לצרכן.</p>
                  <p>9.4 אם הוראה מהוראות הסכם זה תימצא בלתי חוקית או בלתי ניתנת לאכיפה, יתר הוראות ההסכם ימשיכו לעמוד בתוקפן ככל שניתן.</p>
                </div>

                <div>
                  <p className="font-bold text-slate-800 mb-2">10. קישורים למסמכים מקוונים</p>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 text-xs">
                    <p><span className="font-semibold">פירוט תוכניות הבריאות:</span> <a href="https://teddyvets.co.il/teddy-health-plans/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://teddyvets.co.il/teddy-health-plans/</a></p>
                    <p><span className="font-semibold">תקנון תוכנית המנויים:</span> <a href="https://teddyvets.co.il/wp-content/uploads/2026/01/teddyvets-membership-terms-2025-12.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">teddyvets-membership-terms-2025-12.pdf</a></p>
                    <p><span className="font-semibold">תנאי שימוש ומדיניות פרטיות:</span> <a href="https://teddyvets.co.il/terms-privacy/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://teddyvets.co.il/terms-privacy/</a></p>
                  </div>
                </div>
              </div>
            </div>

            {/* אישור הלקוח */}
            <div className="bg-slate-50/60 p-6 rounded-xl border border-slate-200/60">
              <h3 className="text-xl font-bold text-slate-700 mb-5">אישור הלקוח</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-blue-50/40 p-4 rounded-lg border border-blue-100/50">
                  <Checkbox id="read" checked={confirmedRead} onCheckedChange={setConfirmedRead} className="mt-1 flex-shrink-0" />
                  <Label htmlFor="read" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                    קראתי את הסכם ההצטרפות והבנתי את תנאיו. <span className="text-red-500 font-bold">*</span>
                  </Label>
                </div>
                <div className="flex items-start gap-3 bg-blue-50/40 p-4 rounded-lg border border-blue-100/50">
                  <Checkbox id="services" checked={confirmedServices} onCheckedChange={setConfirmedServices} className="mt-1 flex-shrink-0" />
                  <Label htmlFor="services" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                    קיבלתי את פירוט השירותים, ההטבות וההחרגות של המסלול שבחרתי (נספח א׳). <span className="text-red-500 font-bold">*</span>
                  </Label>
                </div>
                <div className="flex items-start gap-3 bg-yellow-50/40 p-4 rounded-lg border border-yellow-100/50">
                  <Checkbox id="payment" checked={confirmedPayment} onCheckedChange={setConfirmedPayment} className="mt-1 flex-shrink-0" />
                  <Label htmlFor="payment" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                    אני מאשר/ת לחייב את אמצעי התשלום שמסרתי בהתאם למסלול התשלום שבחרתי. <span className="text-red-500 font-bold">*</span>
                  </Label>
                </div>
                <div className="flex items-start gap-3 bg-orange-50/40 p-4 rounded-lg border border-orange-100/50">
                  <Checkbox id="renewal" checked={confirmedRenewal} onCheckedChange={setConfirmedRenewal} className="mt-1 flex-shrink-0" />
                  <Label htmlFor="renewal" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                    קיבלתי מידע על תקופת המנוי, אופן החידוש ודרכי הביטול וגמר החשבון במקרה של סיום מוקדם. <span className="text-red-500 font-bold">*</span>
                  </Label>
                </div>
                <div className="flex items-start gap-3 bg-green-50/40 p-4 rounded-lg border border-green-100/50">
                  <Checkbox id="marketing" checked={confirmedMarketing} onCheckedChange={setConfirmedMarketing} className="mt-1 flex-shrink-0" />
                  <Label htmlFor="marketing" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                    אני מסכים/ה לקבלת דברי פרסומת (SMS, וואטסאפ, דוא"ל) מרשת Teddy Vets. ניתן לבטל בכל עת.
                  </Label>
                </div>
              </div>
            </div>

            {/* חתימה דיגיטלית */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50/30 p-6 rounded-xl border border-blue-100/50 space-y-4">
                <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-500" />
                  חתימה
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm bg-white p-4 rounded-lg border border-blue-100 mb-4">
                  <div className="text-center">
                    <p className="font-bold text-slate-700 mb-1">שם הלקוח</p>
                    <p className="text-slate-600">{form.owner_name || '-'}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-700 mb-1">חתימה</p>
                    <p className="text-slate-400 text-xs">(בשדה מטה)</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-700 mb-1">תאריך</p>
                    <p className="text-slate-600">{new Date().toLocaleDateString('he-IL')}</p>
                  </div>
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
                disabled={isSubmitting || !confirmedRead || !confirmedServices || !confirmedPayment || !confirmedRenewal}
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