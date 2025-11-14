import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  FileText, 
  Users, 
  PawPrint, 
  ClipboardCheck,
  Share2,
  Calendar,
  AlertCircle,
  Building2,
  Mail,
  MessageSquare,
  Shield,
  CheckCircle
} from "lucide-react";

export default function UserManualPage() {
  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">מדריך למשתמש</h1>
            <p className="text-slate-600 mt-2">מדריך מלא לשימוש במערכת טדי וטס</p>
          </div>
        </div>

        {/* סקירה כללית */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="text-xl font-bold text-slate-800">
              ברוכים הבאים למערכת טדי וטס
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-slate-700 leading-relaxed">
              מערכת טדי וטס היא פלטפורמה מקיפה לניהול מרפאות וטרינריות, המאפשרת ניהול יעיל של טפסים דיגיטליים, 
              תורים, פניות חירום ונתוני לקוחות וחיות מחמד.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">תכונות עיקריות:</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>ניהול טפסי היכרות דיגיטליים ללקוחות חדשים</li>
                <li>טפסי הסכמה לניתוחים והליכים רפואיים עם חתימה דיגיטלית</li>
                <li>מערכת קביעת תורים חכמה לחיסונים וביקורים רפואיים</li>
                <li>יצירת קישורים מאובטחים לשיתוף עם לקוחות</li>
                <li>ממשק ניהול מרכזי עם דשבורד מתקדם</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* דשבורד ראשי */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Building2 className="w-5 h-5 text-blue-500" />
              הדשבורד הראשי
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg text-slate-800">מבנה הדשבורד:</h3>
            
            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">📊 כרטיסיות סטטיסטיקה</h4>
                <p className="text-slate-700">3 כרטיסיות עם נתונים מרכזיים:</p>
                <ul className="list-disc list-inside mt-2 text-slate-600 space-y-1">
                  <li><strong>טפסי היכרות</strong> - טפסים שהתקבלו מלקוחות חדשים (סה"כ + כמה הגיעו היום)</li>
                  <li><strong>טפסי הסכמה</strong> - טפסי הסכמה לניתוחים והליכים רפואיים (סה"כ + כמה הגיעו היום)</li>
                  <li><strong>בקשות תור</strong> - תורים שמחכים לאישור ותיאום</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">⚡ פעולות מהירות</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>טופס היכרות</strong> - יצירת טופס היכרות חדש ללקוח</li>
                  <li><strong>טופס הסכמה</strong> - יצירת טופס הסכמה לניתוח</li>
                  <li><strong>ניהול תורים</strong> - מעבר לעמוד ניהול התורים</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">📋 טבלת טפסים אחרונים</h4>
                <p className="text-slate-700">הדשבורד מציג טבלה מרכזית עם הטפסים האחרונים:</p>
                <ul className="list-disc list-inside mt-2 text-slate-600 space-y-1">
                  <li><strong>משתמש רגיל:</strong> 20 הטפסים האחרונים מהמרפאה</li>
                  <li><strong>אדמין:</strong> טבלה נפרדת לכל מרפאה עם 15 הטפסים האחרונים</li>
                  <li>הטבלה כוללת: תאריך, סוג טופס, בעלים, חיית מחמד, סטטוס וכפתור צפייה</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* יצירת קישורים מאובטחים */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <FileText className="w-5 h-5 text-blue-500" />
              טפסי היכרות
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-slate-700">
              טופס מקיף לאיסוף מידע על לקוחות חדשים וחיות המחמד שלהם.
            </p>

            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-800 mb-2">איך ליצור טופס היכרות?</h4>
              <ol className="list-decimal list-inside space-y-2 text-slate-700">
                <li>לחצו על <strong>"טופס היכרות"</strong> בפעולות המהירות בדשבורד</li>
                <li>מלאו פרטי בסיס של הלקוח (שם, טלפון, אימייל)</li>
                <li>מלאו פרטי חיית המחמד הבסיסיים</li>
                <li>הטופס יישמר כטיוטה במערכת</li>
                <li>ניתן לשלוח קישור ללקוח להשלמת הטופס המלא</li>
              </ol>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">מה הלקוח ממלא בטופס?</h4>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>פרטים אישיים מלאים ואיש קשר לחירום</li>
                <li>פרטי חיית המחמד (גזע, גיל, מין, משקל, צבע וסימנים)</li>
                <li>מידע על ביטוח רפואי (אם קיים)</li>
                <li>היסטוריה רפואית, תרופות ואלרגיות</li>
                <li>מידע התנהגותי ורמת חרדה אצל וטרינר</li>
                <li>סיבת הביקור הנוכחית ונושאים נוספים לדיון</li>
                <li>העלאת פנקס חיסונים וסיכום טיפולים קודמים</li>
                <li>תמונה של חיית המחמד</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">✨ יצירת לקוח וחיה אוטומטית:</h4>
              <p className="text-slate-700">
                לאחר שהלקוח שולח את הטופס המלא, ניתן ללחוץ על <strong>"צור לקוח וחיית מחמד"</strong> ו:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1 mt-2">
                <li>המערכת תיצור אוטומטית רשומת לקוח חדשה</li>
                <li>תיצור רשומת חיית מחמד חדשה</li>
                <li>תקשר את הטופס ללקוח ולחיה</li>
                <li>כל הטפסים הבאים של הלקוח יתקשרו אוטומטית לפרופיל שלו</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* קביעת תורים */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Calendar className="w-5 h-5 text-green-500" />
              מערכת ניהול תורים
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-slate-700">
              מערכת מתקדמת לניהול בקשות תורים מלקוחות, עם תזכורות אוטומטיות ומעקב מלא.
            </p>

            <div className="space-y-3">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">🌐 קישור ציבורי לקביעת תור:</h4>
                <p className="text-slate-700 mb-2">
                  שתפו את הקישור הזה עם לקוחות לקביעת תור עצמאית:
                </p>
                <code className="block bg-white p-2 rounded text-sm text-slate-700 border">
                  https://[כתובת-האפליקציה]/AppointmentBooking
                </code>
                <p className="text-slate-600 text-sm mt-2">
                  ⭐ הקישור אינו מצריך אימות ופתוח לציבור הרחב - שתפו אותו באתר, בפייסבוק או בוואטסאפ
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">מה הלקוח עושה בקישור?</h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-700">
                  <li>בוחר האם הוא לקוח חדש או חוזר</li>
                  <li>בוחר מרפאה מהרשימה (תל אביב/רעננה/בקרוב)</li>
                  <li>בוחר סוג חיית המחמד (כלב/חתול)</li>
                  <li>ממלא פרטים: שם החיה, שם הבעלים, טלפון ואימייל (חובה)</li>
                  <li>בוחר סוג שירות: <strong>חיסון שגרתי</strong> או <strong>ביקור רפואי</strong></li>
                  <li><strong>עבור חיסון:</strong> בוחר את סוגי החיסונים (משושה, כלבת, שעלת, תולעת הפארק, תילוע, טיפול ראשון לגורים)</li>
                  <li><strong>עבור ביקור רפואי:</strong> בוחר את הסיבה (חירום, בדיקה שגרתית, בעיות עיכול, עור, שיניים, פציעה, נשימה, אחר)</li>
                  <li>בוחר תאריך ושעה מועדפים</li>
                  <li>מאשר ושולח - התור נשמר במערכת!</li>
                </ol>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">📱 מה קורה אחרי שהלקוח שולח?</h4>
                <p className="text-slate-700 mb-2"><strong>לקוח חדש:</strong></p>
                <ul className="list-disc list-inside text-slate-600 space-y-1 mb-3">
                  <li>המערכת יוצרת טופס היכרות אוטומטי</li>
                  <li>הלקוח מקבל מייל עם קישור למילוי טופס ההיכרות</li>
                  <li>הלקוח מקבל מידע מותאם אישית (טיפים לחיסון או לביקור רפואי)</li>
                </ul>
                <p className="text-slate-700 mb-2"><strong>לקוח חוזר:</strong></p>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li>הלקוח מקבל אישור קבלה למייל</li>
                  <li>מקבל מידע מותאם אישית על הביקור</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">ניהול תורים מהמערכת:</h4>
                <p className="text-slate-700 mb-2">
                  צוות המרפאה יכול לנהל תורים דרך עמוד <strong>"ניהול תורים"</strong>:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li>צפייה בכל בקשות התורים</li>
                  <li>חיפוש לפי שם בעלים, שם חיה או טלפון</li>
                  <li>סינון לפי סטטוס (הוגש/מאושר/הושלם/בוטל)</li>
                  <li>עריכת פרטי תור (תאריך, שעה, הערות)</li>
                  <li>אישור תור - שולח למערכת התזכורות האוטומטיות</li>
                  <li>הוספת הערות פנימיות לצוות</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">🔔 תזכורות אוטומטיות:</h4>
                <p className="text-slate-700 mb-2">
                  כאשר תור מאושר ויש לו תאריך ושעה מדויקים, המערכת שולחת:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>24 שעות לפני התור</strong> - תזכורת ראשונה במייל</li>
                  <li><strong>2 שעות לפני התור</strong> - תזכורת שנייה סמוך להגעה</li>
                  <li>התזכורות כוללות: שם החיה, תאריך, שעה, כתובת המרפאה ופרטי התור</li>
                </ul>
                <p className="text-slate-600 text-sm mt-2">
                  💡 התזכורות נשלחות אוטומטית באמצעות Cron Job שרץ כל שעה
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* טפסי הסכמה */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <ClipboardCheck className="w-5 h-5 text-purple-500" />
              טפסי הסכמה לניתוחים
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <p className="text-slate-700">
              טופס דיגיטלי מאובטח להסכמת בעלים לפני ניתוחים והליכים רפואיים, עם חתימה דיגיטלית מאובטחת.
            </p>

            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-800 mb-2">יצירת טופס הסכמה:</h4>
              <ol className="list-decimal list-inside space-y-2 text-slate-700">
                <li>לחצו על <strong>"טופס הסכמה"</strong> בפעולות המהירות בדשבורד</li>
                <li>בחרו: <strong>לקוח קיים</strong> (מהמערכת) או <strong>לקוח חדש</strong></li>
                <li>מלאו פרטי הבעלים וחיית המחמד</li>
                <li>הזינו פרטי ההליך הרפואי: סוג הניתוח, תאריך, הערות קליניות</li>
                <li>(אופציונלי) העלו PDF של הצעת מחיר עם פירוט טיפולים ועלויות</li>
                <li>המערכת תיצור קישור מאובטח לשיתוף עם הלקוח</li>
              </ol>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">מה הלקוח רואה ומאשר?</h4>
              <p className="text-slate-700 mb-2">הטופס כולל:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>פרטי הניתוח המלאים והתאריך</li>
                <li>הסכמה להרדמה כללית והסבר על הסיכונים</li>
                <li>הסכמה לניתוח והסברים על הסיכונים הכירורגיים</li>
                <li>הסכמה לבדיקות טרום ניתוחיות (דם, לב, אקו-קרדיוגרפיה)</li>
                <li>הסכמה כספית ותצוגה של הצעת מחיר (אם הועלתה)</li>
                <li>אזור חתימה דיגיטלית בסוף הטופס</li>
              </ul>
            </div>

            <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
              <h4 className="font-semibold text-rose-900 mb-2">🔐 אבטחה משפטית:</h4>
              <p className="text-slate-700 mb-2">
                הטופס כולל אמצעי אבטחה מתקדמים לעמידה בתקנות:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>חתימה דיגיטלית עם hash SHA-256 של החתימה והטופס</li>
                <li>רישום IP, User-Agent וזמן החתימה המדויקים</li>
                <li>PDF חתום ומוצפן נוצר אוטומטית ונשמר בצורה מאובטחת</li>
                <li>הטופס נעול לשינויים לאחר חתימה (immutable_record = true)</li>
                <li>ניתן להוריד את ה-PDF החתום בכל עת</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">📋 צפייה וניהול:</h4>
              <p className="text-slate-700 mb-2">
                מסך <strong>"טפסי הסכמה"</strong> מאפשר:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>צפייה בכל טפסי ההסכמה של המרפאה</li>
                <li>סינון לפי סטטוס (ממתין/נחתם/הושלם)</li>
                <li>חיפוש לפי שם בעלים או שם חיית מחמד</li>
                <li>צפייה בטופס המלא כולל החתימה</li>
                <li>הורדת PDF חתום לתיעוד וארכיון</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* ניהול לקוחות וחיות */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Users className="w-5 h-5 text-blue-500" />
              <PawPrint className="w-5 h-5 text-orange-500" />
              ניהול לקוחות וחיות מחמד
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-slate-700">
              מסד נתונים מרכזי לכל הלקוחות וחיות המחמד של המרפאה.
            </p>

            <div className="space-y-3">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">👥 מסך לקוחות:</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li>רשימת כל הלקוחות במרפאה</li>
                  <li>חיפוש מהיר לפי שם, טלפון או אימייל</li>
                  <li>צפייה בהיסטוריית הטפסים של כל לקוח</li>
                  <li>פרטי קשר ואיש קשר לחירום</li>
                </ul>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-900 mb-2">🐾 מסך חיות מחמד:</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li>רשימת כל החיות במרפאה</li>
                  <li>פילטר לפי סוג חיה (כלב/חתול)</li>
                  <li>היסטוריה רפואית מלאה</li>
                  <li>אלרגיות, תרופות ומחלות כרוניות</li>
                  <li>תמונות ומספר שבב</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">✨ קישור אוטומטי:</h4>
                <p className="text-slate-700">
                  כאשר לקוח ממלא טופס היכרות, המערכת יוצרת אוטומטית:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-1 mt-2">
                  <li>רשומת לקוח חדשה</li>
                  <li>רשומת חיית מחמד חדשה</li>
                  <li>קישור בין הטופס ללקוח/חיה</li>
                  <li>כל הטפסים הבאים מתקשרים אוטומטית</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ניהול מרפאות (אדמין) */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Building2 className="w-5 h-5 text-purple-500" />
              ניהול מרפאות (אדמין)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-slate-700">
              מסך ניהול מיוחד למנהלי מערכת לניהול כל סניפי הרשת.
            </p>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">פונקציות ניהול:</h4>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>הוספת מרפאות חדשות לרשת</li>
                <li>עדכון פרטי מרפאה (כתובת, טלפון, שעות)</li>
                <li>הגדרת רשימת מרפאות חירום חיצוניות</li>
                <li>קביעת הגדרות ייחודיות לכל מרפאה</li>
                <li>השבתת/הפעלת מרפאות</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* טיפים ושיטות עבודה */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <CheckCircle className="w-5 h-5 text-green-500" />
              טיפים ושיטות עבודה מומלצות
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">✅ לקוחות חדשים:</h4>
                <ol className="list-decimal list-inside text-slate-700 space-y-1">
                  <li>כאשר לקוח חדש מבקש תור, המערכת שולחת לו אוטומטית טופס היכרות</li>
                  <li>בקשו מהלקוח למלא את הטופס עד 24 שעות לפני הביקור</li>
                  <li>בדקו את הטופס לפני הביקור להכנה מוקדמת</li>
                  <li>צרו אוטומטית לקוח וחיה במערכת מתוך הטופס</li>
                </ol>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">✅ ניתוחים והליכים:</h4>
                <ol className="list-decimal list-inside text-slate-700 space-y-1">
                  <li>צרו טופס הסכמה מיד עם קביעת תאריך הניתוח</li>
                  <li>שלחו את הקישור ללקוח עד 48-72 שעות לפני</li>
                  <li>העלו הצעת מחיר PDF לטופס (אופציונלי)</li>
                  <li>וודאו שהטופס נחתם לפחות 24 שעות לפני הניתוח</li>
                  <li>הורידו והדפיסו את ה-PDF החתום לתיק הרפואי</li>
                </ol>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">✅ תורים וזימונים:</h4>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li>שתפו את קישור קביעת התור באתר, בפייסבוק ובוואטסאפ</li>
                  <li>בדקו את עמוד <strong>"ניהול תורים"</strong> מספר פעמים ביום</li>
                  <li>אשרו תורים חדשים ועדכנו תאריך/שעה סופיים</li>
                  <li>התקשרו ללקוחות לאישור סופי לפני התור</li>
                  <li>המערכת תשלח תזכורות אוטומטיות 24 שעות ו-2 שעות לפני</li>
                </ul>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">✅ ארגון יומי:</h4>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li>התחילו את היום בבדיקת הדשבורד - ראו טפסים חדשים שהגיעו</li>
                  <li>בדקו בקשות תורים חדשות ואשרו אותן</li>
                  <li>צרו לקוחות וחיות מחמד חדשים מטפסי היכרות שהושלמו</li>
                  <li>צרו טפסי הסכמה לניתוחים המתוכננים</li>
                  <li>עדכנו סטטוסים של תורים שהתקיימו</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* תמיכה */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 shadow-lg">
          <CardContent className="p-6 text-center">
            <Mail className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">צריכים עזרה?</h3>
            <p className="text-slate-700 mb-4">
              אנחנו כאן בשבילכם! צרו קשר עם הצוות שלנו בכל שאלה.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:support@teddyvets.com" className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                <Mail className="w-4 h-4" />
                שלחו מייל
              </a>
              <a href="https://wa.me/972501234567" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                <MessageSquare className="w-4 h-4" />
                וואטסאפ
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}