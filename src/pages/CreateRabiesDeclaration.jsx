
import React, { useState, useEffect } from "react";
import { RabiesDeclaration, Clinic, User } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Calendar, User as UserIcon, PawPrint, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/components/utils/urlHelpers";
import { getEntityList } from "@/components/utils/apiHelpers";

export default function CreateRabiesDeclarationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    clinic_id: "",
    owner_name: "",
    owner_id_number: "",
    owner_phone: "",
    owner_email: "",
    owner_address: "",
    pet_name: "",
    pet_type: "כלב",
    pet_breed: "",
    pet_gender: "",
    pet_birth_date: "",
    pet_age_estimate: "",
    pet_microchip: "",
    pet_neutered: "",
    declaration_date: new Date().toISOString().split('T')[0],
    dog_is_over_3_months: false,
    is_owner_of_dog: false,
    understands_rabies_law: false,
    understands_side_effects: false,
    understands_feces_disposal: false,
    status: "pending"
  });
  const [clinics, setClinics] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        
        let activeClinics = [];
        try {
          activeClinics = await getEntityList(Clinic, { is_active: true });
        } catch (clinicError) {
          console.warn("Could not load active clinics list:", clinicError);
          activeClinics = [];
        }
        
        setClinics(activeClinics);
        
        if (user.role !== 'admin' && user.clinic_id) {
          setFormData(prev => ({ ...prev, clinic_id: user.clinic_id }));
        } else if (activeClinics.length > 0) {
          setFormData(prev => ({ ...prev, clinic_id: activeClinics[0].id }));
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        setError("שגיאה בטעינת נתוני משתמש ומרפאות.");
        setClinics([]);
      }
    };
    loadInitialData();
  }, []);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const declaration = await RabiesDeclaration.create(formData);
      
      alert(`הצהרת כלבת נוצרה בהצלחה עבור ${formData.owner_name} ו-${formData.pet_name}.\n\nניתן כעת לשלוח את ההצהרה ללקוח לחתימה.`);
      
      navigate(createPageUrl("RabiesDeclarations"));

    } catch (error) {
      console.error("Error creating rabies declaration:", error);
      setError("אירעה שגיאה ביצירת ההצהרה. אנא נסו שוב.");
      alert("אירעה שגיאה ביצירת ההצהרה. אנא נסו שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = formData.owner_name && formData.owner_id_number && formData.owner_phone && 
                   formData.pet_name && formData.pet_microchip && formData.clinic_id &&
                   formData.dog_is_over_3_months && formData.is_owner_of_dog && 
                   formData.understands_rabies_law && formData.understands_side_effects && 
                   formData.understands_feces_disposal;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("RabiesDeclarations"))}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">יצירת הצהרת כלבת חדשה</h1>
            <p className="text-slate-600 mt-2">מלאו את הפרטים עבור הצהרת הבעלות לפני חיסון כלבת</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-white/90 backdrop-blur-sm border-blue-100 shadow-xl mb-6">
            <CardHeader className="border-b border-blue-100">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <UserIcon className="w-6 h-6 text-blue-500" />
                פרטי הבעלים
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
                  {clinics.length === 0 && (
                    <p className="text-sm text-amber-600 mt-2">
                      לא נמצאו מרפאות פעילות. יש להוסיף לפחות מרפאה אחת במערכת.
                    </p>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium text-slate-700">שם הבעלים המלא *</Label>
                  <Input 
                    value={formData.owner_name} 
                    onChange={(e) => updateFormData('owner_name', e.target.value)} 
                    className="mt-2" 
                    placeholder="הכניסו את שם הבעלים המלא" 
                    required 
                  />
                </div>
                
                <div>
                  <Label className="text-base font-medium text-slate-700">מספר תעודת זהות *</Label>
                  <Input 
                    value={formData.owner_id_number} 
                    onChange={(e) => updateFormData('owner_id_number', e.target.value)} 
                    className="mt-2" 
                    placeholder="מספר תעודת זהות" 
                    required 
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium text-slate-700">מספר טלפון *</Label>
                  <Input 
                    type="tel" 
                    value={formData.owner_phone} 
                    onChange={(e) => updateFormData('owner_phone', e.target.value)} 
                    className="mt-2" 
                    placeholder="מספר טלפון" 
                    required 
                  />
                </div>
                
                <div>
                  <Label className="text-base font-medium text-slate-700">כתובת אימייל</Label>
                  <Input 
                    type="email" 
                    value={formData.owner_email} 
                    onChange={(e) => updateFormData('owner_email', e.target.value)} 
                    className="mt-2" 
                    placeholder="example@email.com" 
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-medium text-slate-700">כתובת מגורים</Label>
                <Input 
                  value={formData.owner_address} 
                  onChange={(e) => updateFormData('owner_address', e.target.value)} 
                  className="mt-2" 
                  placeholder="כתובת מלאה" 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-blue-100 shadow-xl mb-6">
            <CardHeader className="border-b border-blue-100">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <PawPrint className="w-6 h-6 text-green-500" />
                פרטי הכלב
              </CardTitle>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium text-slate-700">שם הכלב *</Label>
                  <Input 
                    value={formData.pet_name} 
                    onChange={(e) => updateFormData('pet_name', e.target.value)} 
                    className="mt-2" 
                    placeholder="שם הכלב" 
                    required 
                  />
                </div>
                
                <div>
                  <Label className="text-base font-medium text-slate-700">גזע הכלב</Label>
                  <Input 
                    value={formData.pet_breed} 
                    onChange={(e) => updateFormData('pet_breed', e.target.value)} 
                    className="mt-2" 
                    placeholder="גזע הכלב" 
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-base font-medium text-slate-700">מין הכלב</Label>
                  <Select 
                    value={formData.pet_gender}
                    onValueChange={(value) => updateFormData('pet_gender', value)}
                    dir="rtl"
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="בחר מין" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="זכר">זכר</SelectItem>
                      <SelectItem value="נקבה">נקבה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-base font-medium text-slate-700">תאריך לידה</Label>
                  <Input 
                    type="date" 
                    value={formData.pet_birth_date} 
                    onChange={(e) => updateFormData('pet_birth_date', e.target.value)} 
                    className="mt-2" 
                  />
                </div>
                
                <div>
                  <Label className="text-base font-medium text-slate-700">גיל משוער</Label>
                  <Input 
                    value={formData.pet_age_estimate} 
                    onChange={(e) => updateFormData('pet_age_estimate', e.target.value)} 
                    className="mt-2" 
                    placeholder="למשל: 2 שנים" 
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium text-slate-700">מספר שבב אלקטרוני *</Label>
                  <Input 
                    value={formData.pet_microchip} 
                    onChange={(e) => updateFormData('pet_microchip', e.target.value)} 
                    className="mt-2" 
                    placeholder="מספר השבב" 
                    required 
                  />
                </div>
                
                <div>
                  <Label className="text-base font-medium text-slate-700">סטטוס עיקור/סירוס</Label>
                  <Select 
                    value={formData.pet_neutered}
                    onValueChange={(value) => updateFormData('pet_neutered', value)}
                    dir="rtl"
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="בחר סטטוס" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="מסורס/מעוקרת">מסורס/מעוקרת</SelectItem>
                      <SelectItem value="לא מסורס/מעוקרת">לא מסורס/מעוקרת</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium text-slate-700">תאריך ההצהרה</Label>
                <Input 
                  type="date" 
                  value={formData.declaration_date} 
                  onChange={(e) => updateFormData('declaration_date', e.target.value)} 
                  className="mt-2" 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-blue-100 shadow-xl mb-6">
            <CardHeader className="border-b border-blue-100">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-500" />
                הצהרות נדרשות
              </CardTitle>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <Checkbox 
                    id="dog_is_over_3_months"
                    checked={formData.dog_is_over_3_months}
                    onCheckedChange={(checked) => updateFormData('dog_is_over_3_months', checked)}
                  />
                  <Label htmlFor="dog_is_over_3_months" className="text-base font-medium text-slate-700 cursor-pointer">
                    אני מצהיר/ה בזאת שכלב זה שלא נשך ולא נושך למשך 10 ימים אחרונים *
                  </Label>
                </div>

                <div className="flex items-start space-x-3 space-x-reverse">
                  <Checkbox 
                    id="is_owner_of_dog"
                    checked={formData.is_owner_of_dog}
                    onCheckedChange={(checked) => updateFormData('is_owner_of_dog', checked)}
                  />
                  <Label htmlFor="is_owner_of_dog" className="text-base font-medium text-slate-700 cursor-pointer">
                    אני מצהיר/ה כי אני הבעלים החוקי של הכלב *
                  </Label>
                </div>

                <div className="flex items-start space-x-3 space-x-reverse">
                  <Checkbox 
                    id="understands_rabies_law"
                    checked={formData.understands_rabies_law}
                    onCheckedChange={(checked) => updateFormData('understands_rabies_law', checked)}
                  />
                  <Label htmlFor="understands_rabies_law" className="text-base font-medium text-slate-700 cursor-pointer">
                    אני מבין/ה את חובות החוק בנוגע לכלבת (חיסון, שבב, רישיון) *
                  </Label>
                </div>

                <div className="flex items-start space-x-3 space-x-reverse">
                  <Checkbox 
                    id="understands_side_effects"
                    checked={formData.understands_side_effects}
                    onCheckedChange={(checked) => updateFormData('understands_side_effects', checked)}
                  />
                  <Label htmlFor="understands_side_effects" className="text-base font-medium text-slate-700 cursor-pointer">
                    אני מבין/ה את תופעות הלוואי האפשריות של החיסון *
                  </Label>
                </div>

                <div className="flex items-start space-x-3 space-x-reverse">
                  <Checkbox 
                    id="understands_feces_disposal"
                    checked={formData.understands_feces_disposal}
                    onCheckedChange={(checked) => updateFormData('understands_feces_disposal', checked)}
                  />
                  <Label htmlFor="understands_feces_disposal" className="text-base font-medium text-slate-700 cursor-pointer">
                    אני מבין/ה את חובת סילוק הפרשות של הכלב *
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="border-t border-blue-100 pt-6 flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(createPageUrl("RabiesDeclarations"))} 
              className="border-slate-200 text-slate-600"
            >
              ביטול
            </Button>
            <Button 
              type="submit" 
              disabled={!canSubmit || isSubmitting} 
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                  יוצר הצהרה...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 ml-2" />
                  צור הצהרת כלבת
                </>
              )}
            </Button>
          </div>
        </form>

        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
}
