import React, { useState, useEffect, useCallback } from "react";
import { DentalCareInstructions, Clinic, User } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, User as UserIcon, PawPrint, Save, CheckCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/components/utils/urlHelpers";
import { getCurrentDateISO } from "@/components/utils/dateUtils";
import { getEntityList, getEntityById, createEntity, updateEntity } from "@/components/utils/apiHelpers";
import PageHeader from "@/components/common/PageHeader";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import VersionControl from "@/components/common/VersionControl";
import userService from "@/components/services/userService";

export default function CreateDentalCareInstructionsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const instructionId = searchParams.get('id');
  const isEditMode = !!instructionId;

  const [formData, setFormData] = useState({
    clinic_id: "",
    owner_name: "",
    pet_name: "",
    procedure_date: new Date().toISOString().split('T')[0],
    post_op_rest_instructions: "היום לאחר ההרדמה / ניתוח יש להקפיד על מנוחה, הגבלת פעילות, בחדר חשוך, נעים ושקט.",
    feeding_instructions: "ביממה הראשונה של ההחלמה ייתכנו הקאות וחוסר אכילה – תופעות לוואי צפויות של ההרדמה. יש להציע מזון ומים במנות קטנות החל מ- [שעת התחלה]. יש להציע שוב מנה קטנה מאוחר יותר בלילה, או למחרת בבוקר, ואף לעזור בהאכלה עם מזון טעים ואהוב. (ניתן למרוח מזון רטוב על החניכיים).",
    medication_instructions_general: "טיפול תרופתי לפי הוראות בסוף גיליון זה.",
    antibiotic_name: "",
    antibiotic_dosage: "",
    antibiotic_frequency: "",
    pain_medication_name: "",
    pain_medication_dosage: "",
    pain_medication_frequency: "",
    local_care_instructions: "לא להרטיב ולא לרחוץ במהלך 10 הימים הקרובים. צחצוח שיניים יומי ונכון, מונע ומעכב את התפתחות המחלה ומעניק עוד תשומת לב ומשחק קצר לחיית המחמד האהובה שלך !!! ניתן לשלב מזון דנטלי העוזר אף הוא לטיפול המונע במחלה !! פנה אלינו לפרטים",
    preventative_care_details: "כיצד מבצעים טיפול מונע? משתמשים במשחת שיניים מיוחדת לחיות - היא מתאימה בטעמה (טעם בקר, עוף) אינה מחייבת לשטוף את הפה, ומכילה מרכיבים מתאימים לבריאות הפה בחיות מחמד. עלינו להרגיל את חיית המחמד באיטיות לטיפול כזה - תחילה לטעם המשחה - פשוט לתת לטעום אחת ליום במשך שבוע לפחות. לאחר מכן יש להרגילה למריחת המשחה בתוך הפה - למרוח את משחת השיניים תחילה על שן אחת, ולאחר מכן לפי שיתוף הפעולה על יותר ויותר שיניים. לאחר שהצלחתם להרגיל את חיית המחמד לטעם המשחה ולמריחתה בתוך הפה, אפשר כעת ממש להתחיל ולצחצח. מומלץ לבצע הטפול מדי יום, בסוף היום, כשכל בני הבית רגועים ושבעים - כולל חיית המחמד שלנו. למעשה - עבורה זהו עוד משחק, ואפילו משחק טעים. בהצלחה. מחויבים לבריאות החיות שלכם.",
    followup_date: "",
    veterinarian_name: "",
    clinic_contact_info: "",
    status: "draft",
    version_number: 1,
    published_at: null,
    published_by: null
  });

  const [clinics, setClinics] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      const activeClinics = await getEntityList(Clinic, { is_active: true });
      setClinics(activeClinics);
      
      if (isEditMode) {
        const instruction = await getEntityById(DentalCareInstructions, instructionId, 'DentalCareInstructions');
        setFormData(prev => ({ 
          ...prev, 
          ...instruction,
          status: instruction.status || "draft",
          version_number: instruction.version_number || 1
        }));
      } else {
        if (user.role !== 'admin' && user.clinic_id) {
          setFormData(prev => ({ ...prev, clinic_id: user.clinic_id, veterinarian_name: user.full_name }));
        } else if (activeClinics.length > 0) {
          setFormData(prev => ({ ...prev, clinic_id: activeClinics[0].id, veterinarian_name: user.full_name }));
        }
      }
    } catch (err) {
      setError("שגיאה בטעינת נתונים ראשוניים.");
    } finally {
      setIsLoading(false);
    }
  }, [instructionId, isEditMode]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    await handleSave('draft');
  };

  const handlePublish = async () => {
    await handleSave('published');
  };

  const handleSave = async (status) => {
    setIsSaving(true);
    setError('');
    
    try {
      const dataToSave = { ...formData, status };

      if (status === 'published') {
        if (!canPublish) {
          setError("לא ניתן לפרסם: יש למלא שם בעלים, שם חיית מחמד, ותאריך הטיפול.");
          setIsSaving(false);
          return;
        }
        dataToSave.published_at = getCurrentDateISO();
        dataToSave.published_by = currentUser?.email;
        dataToSave.version_number = (formData.version_number || 1) + (formData.status === 'draft' ? 1 : 0);
      }

      if (isEditMode) {
        await updateEntity(DentalCareInstructions, instructionId, dataToSave, 'DentalCareInstructions');
        alert(status === 'published' ? "ההנחיות פורסמו בהצלחה!" : "הטיוטה נשמרה בהצלחה!");
      } else {
        await createEntity(DentalCareInstructions, dataToSave, 'DentalCareInstructions');
        alert(status === 'published' ? "הנחיות טיפול שיניים נוצרו ופורסמו בהצלחה!" : "טיוטת הנחיות נוצרה בהצלחה!");
      }
      
      navigate(createPageUrl("DentalCareInstructions"));
    } catch (err) {
      console.error("Error saving instructions:", err);
      setError("אירעה שגיאה בשמירת ההנחיות.");
    } finally {
      setIsSaving(false);
    }
  };

  const canPublish = formData.owner_name && formData.pet_name && formData.procedure_date && formData.clinic_id;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title={isEditMode ? "עריכת הנחיות טיפול שיניים" : "הנחיות חדשות לטיפול שיניים"}
          description="מלאו את הפרטים ליצירת דף הנחיות מותאם אישית"
          backButton={true}
          onBack={() => navigate(createPageUrl("DentalCareInstructions"))}
        />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* עמודה שמאלית - ניהול גרסאות */}
          <div className="lg:col-span-1">
            <VersionControl
              status={formData.status}
              versionNumber={formData.version_number}
              publishedAt={formData.published_at}
              publishedBy={formData.published_by}
              onSaveDraft={handleSaveDraft}
              onPublish={handlePublish}
              isLoading={isSaving}
              canPublish={canPublish}
            />
          </div>

          {/* עמודה ראשית - הטופס */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSaveDraft(); }}>
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl mb-6">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2"><UserIcon className="text-cyan-500"/>פרטי מטופל</CardTitle>
                </CardHeader>
                <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                  {currentUser?.role === 'admin' && (
                    <div className="md:col-span-2">
                      <Label>סניף המרפאה*</Label>
                      <Select value={formData.clinic_id} onValueChange={(v) => updateFormData('clinic_id', v)} dir="rtl">
                        <SelectTrigger><SelectValue placeholder="בחר מרפאה" /></SelectTrigger>
                        <SelectContent>
                          {clinics.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label>שם הבעלים*</Label>
                    <Input value={formData.owner_name} onChange={e => updateFormData('owner_name', e.target.value)} required />
                  </div>
                  <div>
                    <Label>שם חיית המחמד*</Label>
                    <Input value={formData.pet_name} onChange={e => updateFormData('pet_name', e.target.value)} required />
                  </div>
                  <div className="md:col-span-2">
                    <Label>תאריך הטיפול*</Label>
                    <Input type="date" value={formData.procedure_date} onChange={e => updateFormData('procedure_date', e.target.value)} required />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl mb-6">
                <CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><PawPrint className="text-teal-500"/>הנחיות כלליות</CardTitle></CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div><Label>הנחיות למנוחה</Label><Textarea value={formData.post_op_rest_instructions} onChange={e => updateFormData('post_op_rest_instructions', e.target.value)} rows={3} /></div>
                  <div><Label>הנחיות האכלה</Label><Textarea value={formData.feeding_instructions} onChange={e => updateFormData('feeding_instructions', e.target.value)} rows={4} /></div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl mb-6">
                <CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><Sparkles className="text-cyan-500"/>טיפול תרופתי</CardTitle></CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div><Label>הנחיות כלליות לתרופות</Label><Textarea value={formData.medication_instructions_general} onChange={e => updateFormData('medication_instructions_general', e.target.value)} /></div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div><Label>שם אנטיביוטיקה</Label><Input value={formData.antibiotic_name} onChange={e => updateFormData('antibiotic_name', e.target.value)} /></div>
                    <div><Label>מינון</Label><Input value={formData.antibiotic_dosage} onChange={e => updateFormData('antibiotic_dosage', e.target.value)} /></div>
                    <div><Label>תדירות</Label><Input value={formData.antibiotic_frequency} onChange={e => updateFormData('antibiotic_frequency', e.target.value)} /></div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div><Label>שם משכך כאבים</Label><Input value={formData.pain_medication_name} onChange={e => updateFormData('pain_medication_name', e.target.value)} /></div>
                    <div><Label>מינון</Label><Input value={formData.pain_medication_dosage} onChange={e => updateFormData('pain_medication_dosage', e.target.value)} /></div>
                    <div><Label>תדירות</Label><Input value={formData.pain_medication_frequency} onChange={e => updateFormData('pain_medication_frequency', e.target.value)} /></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl mb-6">
                <CardHeader className="border-b"><CardTitle className="flex items-center gap-2"><Sparkles className="text-purple-500"/>טיפול מקומי ומניעה</CardTitle></CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div><Label>הנחיות טיפול מקומי</Label><Textarea value={formData.local_care_instructions} onChange={e => updateFormData('local_care_instructions', e.target.value)} rows={4} /></div>
                  <div><Label>פרטי טיפול מונע</Label><Textarea value={formData.preventative_care_details} onChange={e => updateFormData('preventative_care_details', e.target.value)} rows={6} /></div>
                  <div><Label>תאריך ביקורת</Label><Input type="date" value={formData.followup_date} onChange={e => updateFormData('followup_date', e.target.value)} /></div>
                  <div><Label>שם הווטרינר המטפל</Label><Input value={formData.veterinarian_name} onChange={e => updateFormData('veterinarian_name', e.target.value)} /></div>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}