
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  PawPrint,
  Heart,
  Shield,
  Utensils,
  Bath,
  Bug,
  Siren,
  Ban,
  Phone,
  Home,
  AlertTriangle,
  Download,
  Mail,
  MessageSquare,
  Share2
} from "lucide-react";
import PageHeader from '@/components/common/PageHeader';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/components/utils/urlHelpers';
import { generatePuppyGuidePDF } from '@/functions/generatePuppyGuidePDF';
import userService from '@/components/services/userService';

const GuideSection = ({ icon, title, children }) => (
  <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
        {React.createElement(icon, { className: "w-6 h-6 text-blue-500" })}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4 text-slate-700 leading-relaxed">
      {children}
    </CardContent>
  </Card>
);

const BulletPoint = ({ children }) => (
  <div className="flex items-start gap-3">
    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
    <p>{children}</p>
  </div>
);

const ToxicFoodItem = ({ name }) => (
    <div className="flex flex-col items-center p-2 bg-red-50 border border-red-100 rounded-lg">
        <span className="text-sm font-medium text-red-800">{name}</span>
    </div>
);

function ShareDialog({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    ownerName: '',
    petName: '',
    ownerEmail: '',
    ownerPhone: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async (showAlert = true) => {
    setIsGenerating(true);
    try {
      const user = await userService.getCurrentUser();
      const clinicName = user?.clinic_id ? 'מרפאת טדי וטס' : 'מרפאת טדי וטס';

      const response = await generatePuppyGuidePDF({
        owner_name: formData.ownerName,
        pet_name: formData.petName,
        clinic_name: clinicName
      });

      if (response.data && response.data.success) {
        // המרת base64 ל-blob
        const binaryString = atob(response.data.pdf_base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.data.filename || `puppy-guide-${formData.petName || 'guide'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
        if (showAlert) {
            alert('הקובץ הורד בהצלחה למחשב שלך!');
        }
      } else {
        throw new Error('שגיאה ביצירת הקובץ');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('שגיאה ביצירת הקובץ. אנא נסו שוב.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmailShare = async () => {
    if (!formData.ownerEmail) {
      alert('נא להזין כתובת אימייל');
      return;
    }

    const subject = `מדריך אימוץ גור עבור ${formData.petName || 'חיית המחמד שלכם'}`;
    const body = `שלום ${formData.ownerName},\n\nמצורף מדריך אימוץ גור המכיל מידע חשוב על טיפול נכון בגור החדש.\n\nבהצלחה,\nצוות מרפאות טדי וטס`;
    
    alert("פותח את תוכנת המייל שלך. לאחר שליחת המייל, הקובץ ירד למחשב כדי שתוכל לצרף אותו.");

    // יצירת קישור מייל
    const mailtoUrl = `mailto:${formData.ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    
    // הורדת PDF במקביל
    await handleDownloadPDF(false);
  };

  const handleWhatsAppShare = async () => {
    if (!formData.ownerPhone) {
      alert('נא להזין מספר טלפון');
      return;
    }

    alert("פותח את וואטסאפ. הקובץ ירד למחשב שלך, אנא צרף אותו להודעה.");

    const message = `שלום ${formData.ownerName}, מצורף מדריך אימוץ גור עבור ${formData.petName || 'הגור החדש'} עם מידע חשוב על טיפול נכון. בהצלחה! 🐕`;
    const whatsappUrl = `https://wa.me/${formData.ownerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    
    // פתיחת וואטסאפ
    window.open(whatsappUrl, '_blank');
    
    // הורדת PDF במקביל
    await handleDownloadPDF(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>שליחת מדריך אימוץ ללקוח</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="ownerName">שם הבעלים</Label>
            <Input
              id="ownerName"
              value={formData.ownerName}
              onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
              placeholder="שם הלקוח"
            />
          </div>
          
          <div>
            <Label htmlFor="petName">שם הגור</Label>
            <Input
              id="petName"
              value={formData.petName}
              onChange={(e) => setFormData({...formData, petName: e.target.value})}
              placeholder="שם הגור"
            />
          </div>
          
          <div>
            <Label htmlFor="ownerEmail">אימייל ללקוח</Label>
            <Input
              id="ownerEmail"
              type="email"
              value={formData.ownerEmail}
              onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})}
              placeholder="email@example.com"
            />
          </div>
          
          <div>
            <Label htmlFor="ownerPhone">טלפון ללקוח (לוואטסאפ)</Label>
            <Input
              id="ownerPhone"
              type="tel"
              value={formData.ownerPhone}
              onChange={(e) => setFormData({...formData, ownerPhone: e.target.value})}
              placeholder="050-1234567"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="flex-1"
              variant="outline"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-2" />
              ) : (
                <Download className="w-4 h-4 ml-2" />
              )}
              הורד PDF
            </Button>
            
            <Button 
              onClick={handleEmailShare}
              disabled={isGenerating || !formData.ownerEmail}
              className="flex-1"
              variant="outline"
            >
              <Mail className="w-4 h-4 ml-2" />
              שלח במייל
            </Button>
            
            <Button 
              onClick={handleWhatsAppShare}
              disabled={isGenerating || !formData.ownerPhone}
              className="flex-1"
              variant="outline"
            >
              <MessageSquare className="w-4 h-4 ml-2" />
              שלח בוואטסאפ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PuppyAdoptionGuidePage() {
    const navigate = useNavigate();
    const [isShareOpen, setIsShareOpen] = useState(false);

    return (
        <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
            <ShareDialog 
              isOpen={isShareOpen} 
              onClose={() => setIsShareOpen(false)} 
            />
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <PageHeader
                      title="ברכות לרגל אימוץ גור כלבים!"
                      description="ברוכים הבאים למשפחת Teddy Vets! הנה מספר דברים שכדאי לדעת."
                      backButton={true}
                      onBack={() => navigate(createPageUrl('Dashboard'))}
                      actionLabel="שתף מדריך"
                      actionIcon={Share2}
                      onAction={() => setIsShareOpen(true)}
                  />
                </div>

                <div className="space-y-8">
                    <Alert variant="destructive" className="bg-orange-50 border-orange-200">
                        <Shield className="h-5 w-5 text-orange-600" />
                        <AlertTitle className="font-bold text-orange-800">חשוב ביותר!</AlertTitle>
                        <AlertDescription className="text-orange-700">
                            אין לאפשר לגור כלבים לא מחוסן לטייל מחוץ לבית לפני שסיים את סדרת חיסוני הגורים!
                        </AlertDescription>
                    </Alert>

                    <GuideSection icon={Utensils} title="תזונה נכונה">
                        <BulletPoint>
                            <strong>מה אוכלים?</strong> חשוב מאוד שגור יקבל מזון מלא ואיכותי המיועד לגורים. יש לוודא שהמרכיב הראשון במזון הוא בשרי, ושהוא מכיל דגנים מלאים המזינים את הגור. סוג המזון צריך להיות מותאם לגודלו הסופי של הכלב (קטן/בינוני/גדול).
                        </BulletPoint>
                        <BulletPoint>
                            <strong>כמה אוכלים?</strong> מומלץ לחלק את המזון תחילה ל-3 ארוחות ביום. יש להתאים את כמות המזון לפי ההנחיות על שק המזון הספציפי. בהמשך, ניתן לרדת לפעמיים ביום.
                        </BulletPoint>
                        <BulletPoint>
                            <strong>שינוי מזון:</strong> כל החלפת מזון חייבת להיעשות בהדרגה. החלפה מהירה מדי עלולה לגרום לשיבוש בעיכול.
                        </BulletPoint>
                    </GuideSection>
                    
                     <GuideSection icon={Ban} title="מזונות אסורים ורעילים">
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>כלל אצבע: אם אתם לא בטוחים ב-100% שמותר - לא נותנים!</AlertTitle>
                        </Alert>
                         <div className="mt-4">
                             <p className="font-semibold mb-2 text-slate-800">אסור בהחלט:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>עצמות עוף</li>
                                <li>תבלינים</li>
                                <li>מוצרי חלב</li>
                            </ul>
                         </div>
                         <div className="mt-4">
                             <p className="font-semibold mb-2 text-red-800">רעיל במיוחד:</p>
                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                                <ToxicFoodItem name="שוקולד" />
                                <ToxicFoodItem name="בצל ושום" />
                                <ToxicFoodItem name="אגוזי מקדמיה" />
                                <ToxicFoodItem name="ענבים וצימוקים" />
                                <ToxicFoodItem name="אלכוהול" />
                                <ToxicFoodItem name="קפה" />
                                <ToxicFoodItem name="אבוקדו" />
                                <ToxicFoodItem name="מסטיק ללא סוכר (עם קסיליטול)" />
                             </div>
                         </div>
                    </GuideSection>

                    <GuideSection icon={Bath} title="אמבטיה ורחצה">
                        <p>אין לרחוץ את הגור, מפני שבשלב זה הוא מתקשה לווסת את חום גופו. בבגרות ניתן לרחוץ, אך עדיף לא יותר מפעם בחודש כדי לא לפגוע בהפרשות הטבעיות של העור. אם רוחצים, יש להשתמש בשמפו ייעודי לגורים או שמפו לתינוקות.</p>
                    </GuideSection>

                    <GuideSection icon={Shield} title="חיסונים">
                        <p>כל גור מקבל לפחות 3 חיסוני משושה בהפרשים של 3-4 שבועות. לאחר מכן, לוח הזמנים הוא:</p>
                        <ul className="list-disc list-inside space-y-2 mt-4">
                            <li><strong>חיסון כלבת ושבב:</strong> לאחר סיום סדרת המשושים.</li>
                            <li><strong>תולעת הפארק:</strong> זריקה אחת לחודשיים.</li>
                            <li><strong>בהמשך החיים:</strong> חיסון משושה פעם בשנה, וחיסון כלבת פעם בשנתיים.</li>
                        </ul>
                    </GuideSection>

                    <GuideSection icon={Bug} title="טיפול בטפילים">
                        <BulletPoint>
                            <strong>פרעושים:</strong> יצורים קטנים וקופצניים הגורמים לגירוד. הטיפול המומלץ הוא כדור נגד פרעושים, אך חובה להתייעץ עם וטרינר להתאמת החומר לגיל ולמשקל. בגורים צעירים מאוד ניתן להשתמש בתרסיס Frontline.
                        </BulletPoint>
                        <BulletPoint>
                            <strong>קרציות:</strong> נפוצות בקיץ. מומלץ לענוד קולר נגד קרציות ממרץ ועד אוקטובר.
                        </BulletPoint>
                        <BulletPoint>
                            <strong>תולעי מעיים:</strong> כמעט כל גור נגוע. יש לתת 2 טיפולים נגד תולעים בהפרש של 10 ימים. לכלב בוגר מומלץ לתת טיפול מונע פעם בחצי שנה.
                        </BulletPoint>
                    </GuideSection>

                    <GuideSection icon={Heart} title="סירוס ועיקור">
                        <p>מומלץ לבצע עיקור או סירוס מגיל חצי שנה עד שבעה חודשים. הפעולה מונעת בעיות בריאותיות חמורות (גידולים, דלקות רחם, בעיות פרוסטטה), בעיות התנהגות (בריחה, תוקפנות) ותורמת למניעת ריבוי גורים חסרי בית.</p>
                    </GuideSection>

                    <GuideSection icon={Siren} title="מרכזי חירום 24/7 (פרטיים)">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                <p className="font-bold text-blue-800">מרכז חירום וטרינרי כפר הנוער בן שמן</p>
                                <p className="flex items-center gap-2 mt-1"><Phone className="w-4 h-4" /> 08-6280200</p>
                            </div>
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                <p className="font-bold text-blue-800">חוות דעת - מרכז חירום וטרינרי</p>
                                <p className="flex items-center gap-2 mt-1"><Home className="w-4 h-4" /> זאב בלפור 9, כפר סבא</p>
                                <p className="flex items-center gap-2 mt-1"><Phone className="w-4 h-4" /> 09-7431117</p>
                            </div>
                        </div>
                    </GuideSection>

                </div>
                 <footer className="text-center mt-12">
                    <p className="text-sm text-slate-500">בכל שאלה או בעיה, תמיד ניתן לפנות אלינו למרפאה בטלפון 08-6744200 או בווטסאפ 050-8881586</p>
                    <p className="text-xs text-slate-400 mt-2">© {new Date().getFullYear()} כל הזכויות שמורות למרפאות טדי וטס</p>
                </footer>
            </div>
        </div>
    );
}
