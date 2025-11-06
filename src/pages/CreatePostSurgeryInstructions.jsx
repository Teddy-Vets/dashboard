import React, { useState, useEffect, useCallback } from "react";
import { PostSurgeryInstructions, Clinic } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, CheckCircle, Stethoscope, User as UserIcon, PawPrint, Calendar } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/components/utils/urlHelpers";
import { getCurrentDateISO } from "@/components/utils/dateUtils";

import userService from "@/components/services/userService";
import { getEntityList, getEntityById, createEntity, updateEntity } from "@/components/utils/apiHelpers";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import VersionControl from "@/components/common/VersionControl";

export default function CreatePostSurgeryInstructionsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const instructionId = searchParams.get('id');
  const isEditMode = !!instructionId;

  const [formData, setFormData] = useState({
    clinic_id: "",
    pet_name: "",
    owner_name: "",
    surgery_date: "",
    surgery_type: "",
    fasting_until_hour: "",
    feeding_instructions: "מזון קל למחרת הניתוח",
    wound_location: "",
    antibiotic_name: "",
    antibiotic_instructions: "",
    pain_medication_name: "",
    pain_medication_instructions: "",
    additional_medication_name: "",
    additional_medication_instructions: "",
    followup_date: "",
    special_instructions: "",
    veterinarian_name: "",
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
    setError('');
    
    try {
      const user = await userService.getCurrentUser();
      setCurrentUser(user);

      let activeClinics = [];
      try {
        activeClinics = await getEntityList(Clinic, { is_active: true }, '-created_date', null, 'Clinic');
      } catch (clinicError) {
        console.warn("Could not load clinics:", clinicError);
      }
      setClinics(activeClinics);

      if (isEditMode) {
        const instruction = await getEntityById(PostSurgeryInstructions, instructionId, 'PostSurgeryInstructions');
        setFormData(prev => ({ 
          ...prev, 
          ...instruction,
          status: instruction.status || "draft",
          version_number: instruction.version_number || 1
        }));
      } else {
        let defaultClinicId = "";
        if (user.role !== 'admin' && user.clinic_id) {
          defaultClinicId = user.clinic_id;
        } else if (activeClinics.length > 0) {
          defaultClinicId = activeClinics[0].id;
        }
        setFormData(prev => ({ 
          ...prev, 
          clinic_id: defaultClinicId,
          surgery_date: getCurrentDateISO().split('T')[0]
        }));
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("שגיאה בטעינת נתוני המערכת. אנא רענן את העמוד.");
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
      const dataToSave = {
        ...formData,
        status,
        clinic_id: formData.clinic_id || (currentUser?.role !== 'admin' && currentUser?.clinic_id) || (clinics.length > 0 ? clinics[0].id : "")
      };

      if (!dataToSave.clinic_id) {
        setError("אנא בחרו מרפאה לפני שמירה.");
        setIsSaving(false);
        return;
      }

      if (status === 'published') {
        if (!canPublish) {
          setError("לא ניתן לפרסם: יש למלא שם בעלים, שם חיית מחמד, תאריך ניתוח וסוג ניתוח.");
          setIsSaving(false);
          return;
        }
        dataToSave.published_at = getCurrentDateISO();
        dataToSave.published_by = currentUser?.email;
        
        if (isEditMode) {
          dataToSave.version_number = (formData.version_number || 0) + 1;
        } else {
          dataToSave.version_number = 1;
        }
      }

      let resultInstruction;
      if (isEditMode) {
        resultInstruction = await updateEntity(PostSurgeryInstructions, instructionId, dataToSave, 'PostSurgeryInstructions');
        alert(status === 'published' ? 
          'ההנחיות עודכנו ופורסמו בהצלחה!' : 
          'הטיוטה נשמרה בהצלחה!'
        );
      } else {
        resultInstruction = await createEntity(PostSurgeryInstructions, dataToSave, 'PostSurgeryInstructions');
        alert(status === 'published' ? 
          'ההנחיות נוצרו ופורסמו בהצלחה!' : 
          'הטיוטה נשמרה בהצלחה!'
        );
      }
      
      navigate(createPageUrl("PostSurgeryInstructions"));

    } catch (err) {
      console.error("Error saving instructions:", err);
      setError("אירעה שגיאה בשמירת ההנחיות. אנא נסו שוב.");
    } finally {
      setIsSaving(false);
    }
  };

  const canPublish = formData.pet_name && formData.owner_name && formData.surgery_type && formData.surgery_date && formData.clinic_id;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error && !isSaving) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl("PostSurgeryInstructions"))}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold text-slate-800">הנחיות שחרור</h1>
          </div>
          <ErrorMessage error={error} onRetry={loadInitialData} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("PostSurgeryInstructions"))}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {isEditMode ? 'עריכת הנחיות שחרור' : 'יצירת הנחיות שחרור חדשות'}
            </h1>
            <p className="text-slate-600 mt-2">
              {isEditMode ? 'ערכו את ההנחיות ושמרו כטיוטה או פרסמו אותן' : 'מלאו את כל הפרטים הנדרשים ליצירת הנחיות שחרור חדשות'}
            </p>
          </div>
        </div>

        {error && isSaving && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form Content */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-sm border-blue-100 shadow-xl">
              <CardHeader className="border-b border-blue-100">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-green-500" />
                  פרטי ההנחיות
                </CardTitle>
              </CardHeader>

              <CardContent className="p-8 space-y-6">
                {currentUser?.role === 'admin' && (
                  <div>
                    <Label className="text-base font-medium text-slate-700">בחירת סניף המרפאה *</Label>
                    <Select 
                      value={formData.clinic_id}
                      onValueChange={(value) => updateFormData('clinic_id', value)}
                      disabled={clinics.length === 0}
                      dir="rtl"
                    >
                      <SelectTrigger className="mt-2">
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
                {currentUser?.role !== 'admin' && currentUser?.clinic_id && (
                  <div>
                    <Label className="text-base font-medium text-slate-700">מרפאה</Label>
                    <Input
                      value={clinics.find(c => c.id === currentUser.clinic_id)?.name || "טוען..."}
                      className="mt-2 bg-gray-100 cursor-not-allowed"
                      disabled
                    />
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-medium text-slate-700 flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-blue-500" />
                      שם הבעלים *
                    </Label>
                    <Input 
                      value={formData.owner_name} 
                      onChange={(e) => updateFormData('owner_name', e.target.value)} 
                      className="mt-2" 
                      placeholder="שם הבעלים המלא" 
                    />
                  </div>
                  <div>
                    <Label className="text-base font-medium text-slate-700 flex items-center gap-2">
                      <PawPrint className="w-4 h-4 text-orange-500" />
                      שם חיית המחמד *
                    </Label>
                    <Input 
                      value={formData.pet_name} 
                      onChange={(e) => updateFormData('pet_name', e.target.value)} 
                      className="mt-2" 
                      placeholder="שם חיית המחמד" 
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-medium text-slate-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-500" />
                      תאריך הניתוח *
                    </Label>
                    <Input 
                      type="date" 
                      value={formData.surgery_date} 
                      onChange={(e) => updateFormData('surgery_date', e.target.value)} 
                      className="mt-2" 
                    />
                  </div>
                  <div>
                    <Label className="text-base font-medium text-slate-700 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-purple-500" />
                      סוג הניתוח *
                    </Label>
                    <Input 
                      value={formData.surgery_type} 
                      onChange={(e) => updateFormData('surgery_type', e.target.value)} 
                      className="mt-2" 
                      placeholder="לדוגמה: סירוס, עיקור, ניקוי שיניים" 
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium text-slate-700">שעת סיום צום</Label>
                  <Input 
                    type="time"
                    value={formData.fasting_until_hour} 
                    onChange={(e) => updateFormData('fasting_until_hour', e.target.value)} 
                    className="mt-2" 
                    placeholder="לדוגמה: 18:00" 
                  />
                </div>

                <div>
                  <Label className="text-base font-medium text-slate-700">הנחיות האכלה</Label>
                  <Textarea 
                    value={formData.feeding_instructions} 
                    onChange={(e) => updateFormData('feeding_instructions', e.target.value)} 
                    className="mt-2" 
                    rows={3}
                    placeholder="הנחיות מפורטות להאכלה לאחר הניתוח"
                  />
                </div>

                <div>
                  <Label className="text-base font-medium text-slate-700">מיקום התפר/חתך</Label>
                  <Input 
                    value={formData.wound_location} 
                    onChange={(e) => updateFormData('wound_location', e.target.value)} 
                    className="mt-2" 
                    placeholder="לדוגמה: בטן, רגל ימין" 
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-medium text-slate-700">אנטיביוטיקה</Label>
                    <Input 
                      value={formData.antibiotic_name} 
                      onChange={(e) => updateFormData('antibiotic_name', e.target.value)} 
                      placeholder="שם התרופה" 
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-base font-medium text-slate-700">הנחיות מתן אנטיביוטיקה</Label>
                    <Input 
                      value={formData.antibiotic_instructions} 
                      onChange={(e) => updateFormData('antibiotic_instructions', e.target.value)} 
                      placeholder="הנחיות מתן" 
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-medium text-slate-700">משכך כאבים</Label>
                    <Input 
                      value={formData.pain_medication_name} 
                      onChange={(e) => updateFormData('pain_medication_name', e.target.value)} 
                      placeholder="שם התרופה" 
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-base font-medium text-slate-700">הנחיות מתן משכך כאבים</Label>
                    <Input 
                      value={formData.pain_medication_instructions} 
                      onChange={(e) => updateFormData('pain_medication_instructions', e.target.value)} 
                      placeholder="הנחיות מתן" 
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium text-slate-700">תרופה נוספת</Label>
                  <div className="grid md:grid-cols-2 gap-4 mt-2">
                    <Input 
                      value={formData.additional_medication_name} 
                      onChange={(e) => updateFormData('additional_medication_name', e.target.value)} 
                      placeholder="שם התרופה" 
                    />
                    <Input 
                      value={formData.additional_medication_instructions} 
                      onChange={(e) => updateFormData('additional_medication_instructions', e.target.value)} 
                      placeholder="הנחיות מתן" 
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium text-slate-700">תאריך ביקורת</Label>
                  <Input 
                    type="date" 
                    value={formData.followup_date} 
                    onChange={(e) => updateFormData('followup_date', e.target.value)} 
                    className="mt-2" 
                  />
                </div>

                <div>
                  <Label className="text-base font-medium text-slate-700">הנחיות מיוחדות נוספות</Label>
                  <Textarea 
                    value={formData.special_instructions} 
                    onChange={(e) => updateFormData('special_instructions', e.target.value)} 
                    className="mt-2" 
                    rows={4}
                    placeholder="הנחיות מיוחדות נוספות לבעל חיית המחמד..."
                  />
                </div>

                <div>
                  <Label className="text-base font-medium text-slate-700">שם הווטרינר המטפל</Label>
                  <Input 
                    value={formData.veterinarian_name} 
                    onChange={(e) => updateFormData('veterinarian_name', e.target.value)} 
                    className="mt-2" 
                    placeholder="שם הווטרינר" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Version Control Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
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
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(createPageUrl("PostSurgeryInstructions"))} 
                className="w-full border-slate-200 text-slate-600"
              >
                ביטול
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}