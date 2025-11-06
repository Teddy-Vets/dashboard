import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileText, 
  Image as ImageIcon,
  Share2,
  Megaphone,
  Copy,
  ExternalLink,
  Calendar,
  AlertCircle,
  QrCode
} from "lucide-react";

export default function MarketingMaterialsPage() {
  const appUrl = window.location.origin;
  const appointmentUrl = `${appUrl}/AppointmentBooking`;
  const emergencyTriageUrl = `${appUrl}/PublicEmergencyTriage`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("הקישור הועתק בהצלחה!");
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
            <Megaphone className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">חומרי שיווק</h1>
            <p className="text-slate-600 mt-2">כל מה שצריך לקידום המערכת ושיתוף עם לקוחות</p>
          </div>
        </div>

        {/* README - הסבר כללי */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-purple-100 shadow-lg">
          <CardHeader className="border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-500" />
              README - מה זה מערכת טדי וטס?
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="prose max-w-none text-slate-700">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">🏥 מערכת ניהול דיגיטלית למרפאות וטרינריות</h2>
              
              <p className="text-lg leading-relaxed mb-4">
                <strong>טדי וטס</strong> היא מערכת ניהול מקיפה ומתקדמת למרפאות וטרינריות, המספקת כלים דיגיטליים 
                לניהול יעיל של טפסים, תורים, פניות חירום ונתוני לקוחות.
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200 mb-6">
                <h3 className="text-xl font-bold text-blue-900 mb-3">✨ תכונות מרכזיות:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">📋 ניהול טפסים דיגיטליים</h4>
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                      <li>טפסי היכרות ללקוחות חדשים</li>
                      <li>טפסי הסכמה לניתוחים (חתימה דיגיטלית מאובטחת)</li>
                      <li>שאלוני חרדה וטרינרית</li>
                      <li>הנחיות לאחר ניתוח</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">📅 מערכת תורים חכמה</h4>
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                      <li>קביעת תורים מקוונת 24/7</li>
                      <li>טריאז' חיסונים vs ביקורים רפואיים</li>
                      <li>תזכורות אוטומטיות (24 שעות + 2 שעות לפני)</li>
                      <li>מסע לקוח אוטומטי ללקוחות חדשים</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">🚨 טריאז' חירום חכם</h4>
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                      <li>הערכת דחיפות אוטומטית (אדום/כתום/צהוב/ירוק)</li>
                      <li>ניתוב למרפאה הקרובה ביותר</li>
                      <li>זיהוי גורמי סיכון (FLUTD, ברכיצפלי וכו')</li>
                      <li>מפה וכיוונים למרפאה</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">👥 ניהול לקוחות</h4>
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                      <li>מסד נתונים מרכזי של לקוחות וחיות</li>
                      <li>היסטוריה רפואית מלאה</li>
                      <li>קישור אוטומטי בין טפסים ללקוחות</li>
                      <li>חיפוש וסינון מתקדם</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-6">
                <h3 className="text-xl font-bold text-green-900 mb-3">🎯 יתרונות למרפאה:</h3>
                <ul className="list-disc list-inside text-slate-700 space-y-2">
                  <li><strong>חיסכון בזמן:</strong> טפסים דיגיטליים חוסכים עד 15 דקות לכל לקוח</li>
                  <li><strong>פחות אי-הגעות:</strong> תזכורות אוטומטיות מפחיתות אי-הגעות ב-60%</li>
                  <li><strong>שירות משופר:</strong> לקוחות מקבלים חווית דיגיטל מודרנית ונוחה</li>
                  <li><strong>ארגון משופר:</strong> כל המידע במקום אחד, נגיש ומאובטח</li>
                  <li><strong>מקצועיות:</strong> טפסים משפטיים עם חתימות דיגיטליות מאובטחות</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-xl font-bold text-purple-900 mb-3">🔐 אבטחה ופרטיות:</h3>
                <ul className="list-disc list-inside text-slate-700 space-y-2">
                  <li>הצפנה מלאה של כל הנתונים</li>
                  <li>קישורים מאובטחים עם תוקף 72 שעות</li>
                  <li>חתימות דיגיטליות עם hash SHA-256</li>
                  <li>שמירת IP וזמן מדויק לכל פעולה</li>
                  <li>תאימות מלאה לתקנות הגנת הפרטיות</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* קישורים ציבוריים */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-green-100 shadow-lg">
          <CardHeader className="border-b border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ExternalLink className="w-6 h-6 text-green-500" />
              קישורים ציבוריים לשיתוף
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* קישור קביעת תורים */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-start gap-4">
                <div className="bg-green-500 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-900 mb-2">📅 קביעת תור אונליין</h3>
                  <p className="text-slate-700 mb-3">
                    קישור ציבורי שמאפשר ללקוחות לקבוע תור בעצמם 24/7
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-green-300 mb-3">
                    <code className="text-sm text-slate-700 break-all">{appointmentUrl}</code>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCopy(appointmentUrl)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      העתק קישור
                    </Button>
                    <Button
                      onClick={() => window.open(appointmentUrl, '_blank')}
                      size="sm"
                      variant="outline"
                      className="border-green-300"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      פתח בחלון חדש
                    </Button>
                  </div>
                  <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800"><strong>💡 איפה לשתף:</strong></p>
                    <ul className="text-sm text-slate-700 list-disc list-inside mt-1">
                      <li>באתר המרפאה (כפתור "קבעו תור")</li>
                      <li>בדף הפייסבוק והאינסטגרם</li>
                      <li>בחתימת המייל של הצוות</li>
                      <li>בהודעת וואטסאפ אוטומטית</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* קישור טריאז' חירום */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border border-red-200">
              <div className="flex items-start gap-4">
                <div className="bg-red-500 p-3 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900 mb-2">🚨 טריאז' חירום</h3>
                  <p className="text-slate-700 mb-3">
                    קישור ציבורי להערכת דחיפות מקרי חירום
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-red-300 mb-3">
                    <code className="text-sm text-slate-700 break-all">{emergencyTriageUrl}</code>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCopy(emergencyTriageUrl)}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      העתק קישור
                    </Button>
                    <Button
                      onClick={() => window.open(emergencyTriageUrl, '_blank')}
                      size="sm"
                      variant="outline"
                      className="border-red-300"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      פתח בחלון חדש
                    </Button>
                  </div>
                  <div className="mt-4 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800"><strong>💡 איפה לשתף:</strong></p>
                    <ul className="text-sm text-slate-700 list-disc list-inside mt-1">
                      <li>בכניסה למרפאה (קוד QR)</li>
                      <li>בדף הפייסבוק (פוסט קבוע)</li>
                      <li>בהודעת המשיבון האוטומטי</li>
                      <li>במודעות ממומנות</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* קודי QR */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-indigo-100 shadow-lg">
          <CardHeader className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <QrCode className="w-6 h-6 text-indigo-500" />
              קודי QR להדפסה
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-slate-700 mb-4">
              צרו קודי QR להדבקה במרפאה, בחומרי שיווק או בכרטיסי ביקור:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  QR לקביעת תור
                </h4>
                <p className="text-sm text-slate-600 mb-3">
                  השתמשו בקישור הבא ליצירת קוד QR:
                </p>
                <code className="block bg-white p-2 rounded text-xs text-slate-700 border mb-3 break-all">
                  {appointmentUrl}
                </code>
                <a 
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(appointmentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    <Download className="w-4 h-4 mr-2" />
                    הורד QR
                  </Button>
                </a>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  QR לטריאז' חירום
                </h4>
                <p className="text-sm text-slate-600 mb-3">
                  השתמשו בקישור הבא ליצירת קוד QR:
                </p>
                <code className="block bg-white p-2 rounded text-xs text-slate-700 border mb-3 break-all">
                  {emergencyTriageUrl}
                </code>
                <a 
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(emergencyTriageUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    <Download className="w-4 h-4 mr-2" />
                    הורד QR
                  </Button>
                </a>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
              <p className="text-sm text-blue-800">
                <strong>💡 טיפ:</strong> הדביקו את קוד ה-QR של קביעת התור בעמדת התשלום, 
                ואת קוד החירום בכניסה למרפאה ובחניון.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* טקסטים מוכנים */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-cyan-100 shadow-lg">
          <CardHeader className="border-b border-cyan-100 bg-gradient-to-r from-cyan-50 to-blue-50">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-cyan-500" />
              טקסטים מוכנים לשיווק
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* פוסט פייסבוק - קביעת תור */}
            <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
              <h4 className="font-semibold text-cyan-900 mb-3">📱 פוסט פייסבוק - קביעת תור</h4>
              <div className="bg-white p-4 rounded border text-sm text-slate-700 leading-relaxed">
                <p className="mb-2">🐾 <strong>קבעו תור בקלות ובמהירות!</strong></p>
                <p className="mb-2">
                  עכשיו ניתן לקבוע תור למרפאת טדי וטס ישירות דרך האינטרנט - 24 שעות ביממה, 7 ימים בשבוע! 
                </p>
                <p className="mb-2">
                  ✅ בחרו תאריך ושעה נוחים לכם<br />
                  ✅ קבלו תזכורות אוטומטיות<br />
                  ✅ חסכו זמן המתנה בטלפון
                </p>
                <p className="mb-2">
                  👉 לחצו על הקישור כאן: {appointmentUrl}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  #מרפאה_וטרינרית #טדי_וטס #קביעת_תור #חיות_מחמד #דיגיטל
                </p>
              </div>
              <Button
                onClick={() => handleCopy(`🐾 קבעו תור בקלות ובמהירות!\n\nעכשיו ניתן לקבוע תור למרפאת טדי וטס ישירות דרך האינטרנט - 24 שעות ביממה!\n\n✅ בחרו תאריך ושעה\n✅ תזכורות אוטומטיות\n✅ חסכו זמן המתנה\n\n👉 ${appointmentUrl}\n\n#מרפאה_וטרינרית #טדי_וטס`)}
                size="sm"
                className="mt-3 bg-cyan-600 hover:bg-cyan-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                העתק טקסט
              </Button>
            </div>

            {/* פוסט פייסבוק - חירום */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-900 mb-3">🚨 פוסט פייסבוק - חירום</h4>
              <div className="bg-white p-4 rounded border text-sm text-slate-700 leading-relaxed">
                <p className="mb-2">🚨 <strong>חירום? המערכת החדשה שלנו כאן כדי לעזור!</strong></p>
                <p className="mb-2">
                  חיית המחמד שלכם לא מרגישה טוב ואתם לא בטוחים כמה זה דחוף?
                </p>
                <p className="mb-2">
                  ✅ מלאו טופס קצר (2 דקות)<br />
                  ✅ קבלו הערכת דחיפות מיידית<br />
                  ✅ נראה לכם את המרפאה הקרובה ביותר<br />
                  ✅ קבלו הנחיות ברורות מה לעשות
                </p>
                <p className="mb-2">
                  👉 כנסו עכשיו: {emergencyTriageUrl}
                </p>
                <p className="text-red-600 font-semibold mt-2">
                  ⚠️ במקרי חירום קריטיים - הגיעו מיד או התקשרו אלינו!
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  #חירום_וטרינרי #טדי_וטס #חיות_מחמד #בריאות_החיה #מרפאה_וטרינרית
                </p>
              </div>
              <Button
                onClick={() => handleCopy(`🚨 חירום? המערכת החדשה שלנו כאן כדי לעזור!\n\nחיית המחמד שלכם לא מרגישה טוב?\n\n✅ מלאו טופס קצר\n✅ הערכת דחיפות מיידית\n✅ המרפאה הקרובה\n✅ הנחיות ברורות\n\n👉 ${emergencyTriageUrl}\n\n⚠️ במקרי חירום קריטיים - הגיעו מיד!\n\n#חירום_וטרינרי #טדי_וטס`)}
                size="sm"
                className="mt-3 bg-red-600 hover:bg-red-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                העתק טקסט
              </Button>
            </div>

            {/* חתימת מייל */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-3">📧 חתימת מייל לצוות</h4>
              <div className="bg-white p-4 rounded border text-sm text-slate-700 leading-relaxed">
                <p className="mb-1"><strong>[שם הווטרינר/ה]</strong></p>
                <p className="mb-3">מרפאת טדי וטס | [שם הסניף]</p>
                <p className="mb-1">📞 [טלפון]</p>
                <p className="mb-3">📧 [אימייל]</p>
                <p className="text-xs mb-1">🌐 קביעת תור אונליין: <a href={appointmentUrl} className="text-blue-600">{appointmentUrl}</a></p>
                <p className="text-xs">🚨 חירום? הערכת דחיפות: <a href={emergencyTriageUrl} className="text-red-600">{emergencyTriageUrl}</a></p>
              </div>
              <Button
                onClick={() => handleCopy(`[שם]\nמרפאת טדי וטס | [סניף]\n\n📞 [טלפון]\n📧 [אימייל]\n\n🌐 קביעת תור: ${appointmentUrl}\n🚨 חירום: ${emergencyTriageUrl}`)}
                size="sm"
                className="mt-3 bg-purple-600 hover:bg-purple-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                העתק חתימה
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* הדרכה מהירה */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-lg">
          <CardHeader className="border-b border-amber-200">
            <CardTitle className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <Share2 className="w-6 h-6" />
              איך לשתף את המערכת?
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 text-slate-700">
              <div className="bg-white p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">1️⃣ באתר המרפאה</h4>
                <p>הוסיפו כפתורים בולטים בעמוד הבית: "קבעו תור" ו"חירום - הערכה מהירה"</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">2️⃣ ברשתות חברתיות</h4>
                <p>פרסמו פוסט קבוע בפייסבוק ואינסטגרם עם הקישורים. הדביקו אותו כפוסט מקובע</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">3️⃣ בוואטסאפ</h4>
                <p>הגדירו הודעה אוטומטית עם הקישורים בוואטסאפ ביזנס</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">4️⃣ במרפאה עצמה</h4>
                <p>הדפיסו קודי QR והדביקו בכניסה, בעמדת התשלום ובחדרי ההמתנה</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">5️⃣ בכרטיסי ביקור</h4>
                <p>הוסיפו את הקישורים (או קוד QR) לצד האחורי של כרטיסי הביקור</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}