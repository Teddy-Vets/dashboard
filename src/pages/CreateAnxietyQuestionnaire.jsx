import React, { useState, useEffect } from "react";
import { AnxietyQuestionnaire, Clinic, User } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Brain, User as UserIcon, PawPrint } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/components/utils/urlHelpers";
import { createFormLink } from "@/functions/createFormLink";
import { getEntityList, createEntity } from "@/components/utils/apiHelpers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export default function CreateAnxietyQuestionnairePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    clinic_id: "",
    owner_name: "",
    owner_email: "",
    owner_phone: "",
    pet_name: "",
    pet_type: "כלב"
  });
  
  const [clinics, setClinics] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        
        const activeClinics = await getEntityList(Clinic, { is_active: true });
        setClinics(activeClinics || []);
        
        if (user.role !== 'admin' && user.clinic_id) {
          setFormData(prev => ({ ...prev, clinic_id: user.clinic_id }));
        } else if (activeClinics && activeClinics.length > 0) {
          setFormData(prev => ({ ...prev, clinic_id: activeClinics[0].id }));
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        setError("שגיאה בטעינת נתונים. אנא רענן את הדף.");
        toast({
          title: "שגיאה",
          description: "שגיאה בטעינת נתונים. אנא רענן את הדף.",
          variant: "destructive",
        });
      }
    };
    loadInitialData();
  }, [toast]);

  const handleCopyLink = async () => {
    if (publicUrl) {
      try {
        await navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        toast({
          title: "הקישור הועתק בהצלחה!",
          description: "ניתן לשלוח אותו כעת ללקוח.",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast({
          title: "שגיאה בהעתקה",
          description: "אנא נסה/י להעתיק ידנית.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const questionnaire = await createEntity(AnxietyQuestionnaire, {
        ...formData,
        status: "draft"
      }, 'AnxietyQuestionnaire');
      
      const { data } = await createFormLink({
        form_type: 'anxiety_questionnaire',
        clinic_id: questionnaire.clinic_id,
        form_id: questionnaire.id,
        metadata: {
          owner_name: questionnaire.owner_name,
          pet_name: questionnaire.pet_name,
        }
      });

      const token = data?.token;
      if (!token) throw new Error("לא התקבל טוקן מהשרת.");
      
      const url = `${window.location.origin}/PublicAnxietyQuestionnaire?t=${token}`;
      setPublicUrl(url);
      setShowSuccessDialog(true);
      setCopied(false);

    } catch (error) {
      console.error("Error creating anxiety questionnaire:", error);
      setError(error.message || "אירעה שגיאה ביצירת השאלון. אנא נסו שוב.");
      toast({
        title: "שגיאה ביצירת שאלון",
        description: error.message || "אירעה שגיאה",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = formData.owner_name && formData.pet_name && formData.clinic_id;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("AnxietyQuestionnaires"))}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
            aria-label="חזרה לרשימת שאלוני חרדה"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">יצירת שאלון חרדת חיות מחמד</h1>
            <p className="text-slate-600 mt-2">מלאו את הפרטים ליצירת שאלון חרדה מותאם ללקוח</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="bg-white/90 backdrop-blur-sm border-blue-100 shadow-xl">
            <CardHeader className="border-b border-blue-100">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-500" />
                פרטי השאלון
              </CardTitle>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              
              {/* Clinic Selection - Admin Only */}
              {currentUser?.role === 'admin' && clinics.length > 0 && (
                <div>
                  <Label htmlFor="clinic-select" className="text-base font-medium text-slate-700">בחירת סניף המרפאה *</Label>
                  <Select 
                    value={formData.clinic_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, clinic_id: value }))}
                    dir="rtl"
                  >
                    <SelectTrigger id="clinic-select" className="mt-2">
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

              {/* Owner Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="owner-name" className="text-base font-medium text-slate-700 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-blue-500" />
                    שם הבעלים *
                  </Label>
                  <Input 
                    id="owner-name"
                    value={formData.owner_name} 
                    onChange={(e) => setFormData(prev => ({ ...prev, owner_name: e.target.value }))} 
                    className="mt-2" 
                    placeholder="הכניסו את שם הבעלים המלא" 
                    required 
                    aria-required="true"
                  />
                </div>
                
                <div>
                  <Label htmlFor="owner-email" className="text-base font-medium text-slate-700">כתובת מייל</Label>
                  <Input 
                    id="owner-email"
                    type="email" 
                    value={formData.owner_email} 
                    onChange={(e) => setFormData(prev => ({ ...prev, owner_email: e.target.value }))} 
                    className="mt-2" 
                    placeholder="example@email.com" 
                  />
                </div>
              </div>

              {/* Pet Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="owner-phone" className="text-base font-medium text-slate-700">טלפון</Label>
                  <Input 
                    id="owner-phone"
                    value={formData.owner_phone} 
                    onChange={(e) => setFormData(prev => ({ ...prev, owner_phone: e.target.value }))} 
                    className="mt-2" 
                    placeholder="מספר טלפון" 
                  />
                </div>
                
                <div>
                  <Label htmlFor="pet-name" className="text-base font-medium text-slate-700 flex items-center gap-2">
                    <PawPrint className="w-4 h-4 text-orange-500" />
                    שם חיית המחמד *
                  </Label>
                  <Input 
                    id="pet-name"
                    value={formData.pet_name} 
                    onChange={(e) => setFormData(prev => ({ ...prev, pet_name: e.target.value }))} 
                    className="mt-2" 
                    placeholder="שם חיית המחמד" 
                    required 
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Pet Type */}
              <div>
                <Label htmlFor="pet-type" className="text-base font-medium text-slate-700">סוג חיית המחמד</Label>
                <Select 
                  value={formData.pet_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, pet_type: value }))}
                  dir="rtl"
                >
                  <SelectTrigger id="pet-type" className="mt-2">
                    <SelectValue placeholder="בחר סוג חיית מחמד" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="כלב">כלב</SelectItem>
                    <SelectItem value="חתול">חתול</SelectItem>
                    <SelectItem value="אחר">אחר</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </CardContent>

            {/* Actions */}
            <div className="border-t border-blue-100 p-6 flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(createPageUrl("AnxietyQuestionnaires"))} 
                className="border-slate-200 text-slate-600"
              >
                ביטול
              </Button>
              <Button 
                type="submit" 
                disabled={!canSubmit || isSubmitting} 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                    יוצר שאלון...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 ml-2" />
                    צור שאלון וקבל קישור
                  </>
                )}
              </Button>
            </div>
          </Card>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-center" role="alert">
            {error}
          </div>
        )}
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">שאלון חרדה נוצר בהצלחה!</DialogTitle>
            <DialogDescription className="text-right">
              השאלון עבור {formData.pet_name} ו-{formData.owner_name} נוצר בהצלחה. 
              הקישור הישיר לשאלון נמצא למטה. שלח/י אותו ללקוח/ה.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="link" className="text-right">קישור לשאלון</Label>
              <Input
                id="link"
                value={publicUrl}
                readOnly
                className="text-left"
                dir="ltr"
                aria-label="קישור לשאלון"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyLink}
            >
              {copied ? "הועתק! ✓" : "העתק קישור"}
            </Button>
            <Button 
              type="button" 
              onClick={() => {
                setShowSuccessDialog(false);
                navigate(createPageUrl("AnxietyQuestionnaires"));
              }}
            >
              סגור ופנה לרשימת שאלונים
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}