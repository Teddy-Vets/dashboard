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
                <li>ניהול טפסי היכרות דיגיטליים</li>
                <li>טפסי הסכמה לניתוחים והליכים רפואיים</li>
                <li>מערכת קביעת תורים מתקדמת עם תזכורות אוטומטיות</li>
                <li>טריאז' חירום לסינון פניות דחופות</li>
                <li>שאלוני חרדה להערכת חרדה וטרינרית</li>
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
                  <li><strong>טפסי היכרות</strong> - סה"כ טפסים + כמה הגיעו היום</li>
                  <li><strong>פניות חירום</strong> - סה"כ פניות + כמה הגיעו היום</li>
                  <li><strong>בקשות תור</strong> - סה"כ בקשות תורים פעילות</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">⚡ פעולות מהירות</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>שליחת טפסים</strong> - יצירת קישורים מאובטחים לשליחה ללקוחות</li>
                  <li><strong>בקשת תור חדשה</strong> - מעבר לעמוד קביעת תורים</li>
                  <li><strong>טופס היכרות חדש</strong> - יצירת טופס היכרות חדש</li>
                  <li><strong>טופס הסכמה חדש</strong> - יצירת טופס הכנה לניתוח</li>
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
              <Share2 className="w-5 h-5 text-purple-500" />
              יצירת קישורים מאובטחים לטפסים
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-slate-700">
              המערכת מאפשרת יצירת קישורים ייחודיים ומאובטחים לשליחה ללקוחות:
            </p>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-3">תהליך יצירת קישור:</h3>
              <ol className="list-decimal list-inside space-y-2 text-slate-700">
                <li>לחצו על <strong>"שליחת טפסים"</strong> בדשבורד</li>
                <li>בחרו את סוג הטופס: היכרות / הסכמה / שאלון חרדה / טריאז' חירום</li>
                <li>בחרו את סניף המרפאה</li>
                <li>מלאו פרטי הלקוח (אופציונלי אבל מומלץ):
                  <ul className="list-disc list-inside mr-6 mt-1 space-y-1">
                    <li>שם הבעלים ושם חיית המחמד</li>
                    <li>טלפון (לשליחה בוואטסאפ)</li>
                    <li>אימייל (לשליחה במייל)</li>
                  </ul>
                </li>
                <li>לחצו על <strong>"צור קישור"</strong></li>
                <li>בחרו באפשרות שליחה:
                  <ul className="list-disc list-inside mr-6 mt-1">
                    <li>📋 העתק קישור</li>
                    <li>💚 שלח בוואטסאפ (הודעה מוכנה)</li>
                    <li>📧 שלח באימייל (הודעה מוכנה)</li>
                  </ul>
                </li>
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">⏰ תוקף הקישור:</h4>
              <p className="text-slate-700">
                כל קישור תקף ל-<strong>72 שעות</strong> בלבד מרגע היצירה, לאבטחה מקסימלית.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-2">🔐 אבטחה:</h4>
              <p className="text-slate-700">
                כל קישור מוגן באמצעות טוקן ייחודי שנוצר במערכת. הנתונים מוצפנים ומאובטחים.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* קביעת תורים */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Calendar className="w-5 h-5 text-green-500" />
              מערכת קביעת תורים
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-slate-700">
              מערכת מתקדמת לניהול בקשות תורים עם תזכורות אוטומטיות ומעקב מלא.
            </p>

            <div className="space-y-3">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">🌐 קישור ציבורי לקביעת תור:</h4>
                <p className="text-slate-700 mb-2">
                  ניתן לשתף קישור ישיר עם לקוחות לקביעת תור עצמית:
                </p>
                <code className="block bg-white p-2 rounded text-sm text-slate-700 border">
                  https://[כתובת-האפליקציה]/AppointmentBooking
                </code>
                <p className="text-slate-600 text-sm mt-2">
                  ⭐ הקישור הזה אינו מצריך אימות ופתוח לציבור הרחב
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">תהליך קביעת תור:</h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-700">
                  <li>הלקוח בוחר האם הוא לקוח חדש או חוזר</li>
                  <li>מזין פרטים אישיים: שם, טלפון, אימייל, פרטי חיית המחמד</li>
                  <li>בוחר סוג השירות: חיסון או ביקור רפואי</li>
                  <li><strong>עבור חיסון:</strong> בוחר את סוגי החיסונים הנדרשים</li>
                  <li><strong>עבור ביקור רפואי:</strong> מתאר את סיבת הביקור</li>
                  <li>בוחר תאריך ושעה מועדפים</li>
                  <li>מאשר ושולח את הבקשה</li>
                </ol>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">🔔 תזכורות אוטומטיות:</h4>
                <p className="text-slate-700 mb-2">
                  המערכת שולחת תזכורות אוטומטיות ללקוחות עם תור מאושר:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>24 שעות לפני התור</strong> - תזכורת ראשונה במייל ובSMS</li>
                  <li><strong>2 שעות לפני התור</strong> - תזכורת שנייה לפני הגעה</li>
                  <li>התזכורות כוללות: תאריך, שעה, כתובת המרפאה ופרטי התור</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">ניהול תורים מהמערכת:</h4>
                <p className="text-slate-700 mb-2">
                  צוות המרפאה יכול לנהל את כל התורים דרך <strong>ניהול תורים</strong>:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li>צפייה בכל בקשות התורים</li>
                  <li>סינון לפי סטטוס (ממתין/מאושר/בוטל)</li>
                  <li>אישור תור וקביעת תאריך סופי</li>
                  <li>עדכון סטטוס ומעקב</li>
                  <li>הוספת הערות פנימיות</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">✨ מסע לקוח אוטומטי:</h4>
                <p className="text-slate-700">
                  כאשר לקוח חדש מבקש תור, המערכת:
                </p>
                <ol className="list-decimal list-inside text-slate-600 space-y-1 mt-2">
                  <li>יוצרת טופס היכרות טיוטה עבורו</li>
                  <li>שולחת לו מייל אוטומטי עם קישור למילוי טופס ההיכרות</li>
                  <li>מזכירה לו להשלים את הטופס לפני התור</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* טריאז' חירום */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <AlertCircle className="w-5 h-5 text-red-500" />
              מערכת טריאז' חירום
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-slate-700">
              מערכת חכמה להערכת דחיפות פניות חירום וניתוב אוטומטי למרפאה המתאימה.
            </p>

            <div className="space-y-3">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">🚨 קישור ציבורי לטריאז' חירום:</h4>
                <p className="text-slate-700 mb-2">
                  קישור ציבורי שניתן לשתף באתר, ברשתות חברתיות או בקוד QR:
                </p>
                <code className="block bg-white p-2 rounded text-sm text-slate-700 border">
                  https://[כתובת-האפליקציה]/PublicEmergencyTriage
                </code>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">איך זה עובד?</h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-700">
                  <li>הלקוח ממלא פרטים בסיסיים על החיה והבעיה</li>
                  <li>המערכת מציגה שאלות סינון לפי דגלונים צבעוניים</li>
                  <li>המערכת מחשבת רמת דחיפות (אדום/כתום/צהוב/ירוק)</li>
                  <li>הלקוח מקבל המלצה מיידית:
                    <ul className="list-disc list-inside mr-6 mt-1 space-y-1">
                      <li className="text-red-600"><strong>🔴 אדום:</strong> הגיעו מיד למרפאה/חירום!</li>
                      <li className="text-orange-600"><strong>🟠 כתום:</strong> פנו בהקדם האפשרי היום</li>
                      <li className="text-yellow-600"><strong>🟡 צהוב:</strong> מעקב ביתי וקביעת תור</li>
                      <li className="text-green-600"><strong>🟢 ירוק:</strong> ניתן לקבוע תור רגיל</li>
                    </ul>
                  </li>
                  <li>המערכת מציגה את המרפאה הקרובה ביותר הפתוחה (עם מפה וכיוונים)</li>
                  <li>הלקוח יכול לשלוח את הטופס למערכת לצורך מעקב</li>
                </ol>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">ממשק ניהול פניות חירום:</h4>
                <p className="text-slate-700">
                  צוות המרפאה רואה את כל הפניות ב<strong>פניות חירום</strong> עם:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-1 mt-2">
                  <li>סינון לפי רמת דחיפות (אדום/כתום/צהוב/ירוק)</li>
                  <li>תגיות סיכון (FLUTD, ברכיצפלי, חזה עמוק וכו')</li>
                  <li>פרטי הבעלים והחיה</li>
                  <li>תמונות וסרטונים שהועלו</li>
                  <li>עדכון סטטוס (הוגש/נוצר קשר/הגיע/בוטל)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* טפסי היכרות */}
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
                <li>לחצו על <strong>"טופס היכרות חדש"</strong> בדשבורד</li>
                <li>מלאו פרטי בסיס (שם בעלים, טלפון, אימייל)</li>
                <li>מלאו פרטי חיית המחמד</li>
                <li>הטופס יישמר כטיוטה במערכת</li>
                <li>יווצר קישור מאובטח שניתן לשלוח ללקוח</li>
              </ol>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">מה הלקוח ממלא בטופס?</h4>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>פרטים אישיים מלאים</li>
                <li>פרטי חיית המחמד (גזע, גיל, מין, משקל)</li>
                <li>ביטוח רפואי (אם יש)</li>
                <li>היסטוריה רפואית ותרופות</li>
                <li>אופי התנהגותי</li>
                <li>סיבת הביקור הנוכחית</li>
                <li>העלאת תמונות ומסמכים</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* טפסי הסכמה */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <ClipboardCheck className="w-5 h-5 text-rose-500" />
              טפסי הכנה לניתוח (הסכמה)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-slate-700">
              טופס דיגיטלי מאובטח להסכמת בעלים לפני ניתוחים והליכים רפואיים.
            </p>

            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-800 mb-2">יצירת טופס הסכמה:</h4>
              <ol className="list-decimal list-inside space-y-2 text-slate-700">
                <li>לחצו על <strong>"טופס הסכמה חדש"</strong></li>
                <li>בחרו: <strong>לקוח קיים</strong> (מתוך המערכת) או <strong>לקוח חדש</strong></li>
                <li>מלאו פרטי ההליך: תאריך, סוג ניתוח, הערות</li>
                <li>המערכת תיצור טופס מלא עם כל הנהלים והסיכונים</li>
                <li>קישור מאובטח יישלח ללקוח לחתימה דיגיטלית</li>
              </ol>
            </div>

            <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
              <h4 className="font-semibold text-rose-900 mb-2">🔐 אבטחה משפטית:</h4>
              <p className="text-slate-700 mb-2">
                הטופס כולל אמצעי אבטחה מתקדמים:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>חתימה דיגיטלית עם hash SHA-256</li>
                <li>רישום IP וזמן החתימה המדויקים</li>
                <li>PDF חתום ומוצפן לאחר השלמת התהליך</li>
                <li>הטופס נעול לשינויים לאחר חתימה (immutable)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* שאלוני חרדה */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Shield className="w-5 h-5 text-indigo-500" />
              שאלוני חרדה וטרינרית
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-slate-700">
              שאלון מקצועי להערכת רמת החרדה של חיות מחמד בביקורים וטרינריים.
            </p>

            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-800 mb-2">מתי להשתמש?</h4>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>לקוחות חדשים עם חיות חרדתיות</li>
                <li>חיות עם היסטוריה של התנגדות בבדיקות</li>
                <li>הכנה לניתוחים או הליכים מורכבים</li>
                <li>משפחות שמתלבטות האם להגיע לבדיקה</li>
              </ul>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-2">מה השאלון מעריך?</h4>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>תגובת החיה בבית כשמדברים על ביקור וטרינר</li>
                <li>התנהגות בדרך למרפאה ובכניסה</li>
                <li>שיתוף פעולה במהלך בדיקות</li>
                <li>רמת החרדה של הבעלים עצמם</li>
                <li>הצעות לשיפור החוויה</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">תוצאות והמלצות:</h4>
              <p className="text-slate-700">
                המערכת מחשבת ציון חרדה (1-10) ומציעה:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1 mt-2">
                <li>בקשת חדר מתנה שקט</li>
                <li>שימוש בתרופות הרגעה קלות</li>
                <li>ביקורי היכרות קצרים (Victory Visits)</li>
                <li>הדרכה מיוחדת לבעלים</li>
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
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">✅ לקוחות חדשים:</h4>
                <ol className="list-decimal list-inside text-slate-700 space-y-1">
                  <li>שלחו טופס היכרות לפני הביקור הראשון</li>
                  <li>בקשו מהלקוח למלא עד 24 שעות לפני הגעה</li>
                  <li>בדקו את הטופס לפני הביקור להכנה מוקדמת</li>
                  <li>שמרו על קשר עין עם הנתונים במהלך הבדיקה</li>
                </ol>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">✅ ניתוחים:</h4>
                <ol className="list-decimal list-inside text-slate-700 space-y-1">
                  <li>צרו טופס הסכמה מיד עם קביעת תאריך הניתוח</li>
                  <li>שלחו את הקישור עד 48-72 שעות לפני</li>
                  <li>וודאו שהטופס נחתם לפחות 24 שעות לפני</li>
                  <li>הדפיסו עותק לתיק הרפואי</li>
                </ol>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">✅ חירום:</h4>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li>פרסמו את קישור הטריאז' באתר ובפייסבוק</li>
                  <li>הדביקו קוד QR בכניסה למרפאה</li>
                  <li>בדקו את לוח פניות החירום מספר פעמים ביום</li>
                  <li>התקשרו לפניות אדומות מיד!</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">✅ ארגון יומי:</h4>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li>התחילו את היום בבדיקת הדשבורד</li>
                  <li>בדקו טפסים חדשים שהגיעו בלילה</li>
                  <li>אשרו תורים ועדכנו סטטוסים</li>
                  <li>שלחו קישורים לטפסים למחר</li>
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