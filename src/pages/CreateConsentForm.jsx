import React, { useState, useEffect } from "react";
import { ConsentForm, Clinic } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, FileCheck, User, PawPrint, Stethoscope, Copy, Check, Trash2, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/components/utils/urlHelpers";
import { createFormLink } from "@/functions/createFormLink";
import { getEntityList, createEntity } from "@/components/utils/apiHelpers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import userService from "@/components/services/userService";

export default function CreateConsentFormPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    clinicId: "",
    clientId: "",
    petId: "",
    ownerName: "",
    ownerId: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerAddress: "",
    petName: "",
    procedureDate: "",
    procedureType: "",
    clinicNotes: "חשוב לשמור על צום של 8-12 שעות (אוכל בלבד, מים מותר) לפני ההגעה למרפאה.",
    treatmentCosts: [],
    totalCost: 0
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
        const user = await userService.getCurrentUser();
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
          setFormData(prev => ({ ...prev, clinicId: user.clinic_id }));
        } else if (activeClinics.length > 0) {
          setFormData(prev => ({ ...prev, clinicId: activeClinics[0].id }));
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
        console.error("Failed to copy URL:", err);
        toast({
          title: "שגיאה בהעתקה",
          description: "אירעה שגיאה בהעתקת הקישור.",
          variant: "destructive",
        });
      }
    }
  };

  // ניהול הצעת מחיר
  const addTreatment = () => {
    setFormData(prev => ({
      ...prev,
      treatmentCosts: [...prev.treatmentCosts, { treatment_name: "", cost: 0 }]
    }));
  };

  const removeTreatment = (index) => {
    setFormData(prev => {
      const newTreatments = prev.treatmentCosts.filter((_, i) => i !== index);
      const newTotal = newTreatments.reduce((sum, t) => sum + (Number(t.cost) || 0), 0);
      return {
        ...prev,
        treatmentCosts: newTreatments,
        totalCost: newTotal
      };
    });
  };

  const updateTreatment = (index, field, value) => {
    setFormData(prev => {
      const newTreatments = [...prev.treatmentCosts];
      newTreatments[index] = { ...newTreatments[index], [field]: value };
      const newTotal = newTreatments.reduce((sum, t) => sum + (Number(t.cost) || 0), 0);
      return {
        ...prev,
        treatmentCosts: newTreatments,
        totalCost: newTotal
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      if (!currentUser) {
        throw new Error("פרטי המשתמש לא נטענו. אנא רענן את הדף ונסה שנית.");
      }

      let targetClinicId = formData.clinicId;
      if (!targetClinicId) {
        targetClinicId = currentUser.clinic_id;
      }
      if (!targetClinicId) {
        if (currentUser.role === 'admin' && clinics.length > 0) {
          targetClinicId = clinics[0].id;
        } else {
          throw new Error("לא ניתן לקבוע את המרפאה המשויכת למשתמש.");
        }
      }

      const consentData = {
        clinic_id: targetClinicId,
        client_id: formData.clientId || null,
        pet_id: formData.petId || null,
        owner_name: formData.ownerName,
        owner_id: formData.ownerId,
        owner_email: formData.ownerEmail,
        owner_phone: formData.ownerPhone,
        owner_address: formData.ownerAddress,
        pet_name: formData.petName,
        procedure_type: formData.procedureType,
        procedure_date: formData.procedureDate,
        clinic_notes: formData.clinicNotes,
        treatment_costs: formData.treatmentCosts,
        total_cost: formData.totalCost,
        status: 'pending'
      };

      const consentForm = await createEntity(ConsentForm, consentData, 'ConsentForm');
      
      const linkResponse = await createFormLink({
        form_type: 'consent',
        clinic_id: targetClinicId,
        form_id: consentForm.id,
        metadata: {
          owner_name: formData.ownerName,
          pet_name: formData.petName,
          procedure_type: formData.procedureType,
        }
      });

      const token = linkResponse.data?.token;
      if (!token) {
        throw new Error("לא התקבל טוקן מהשרת.");
      }
      
      const url = `${window.location.origin}/PublicConsentForm?t=${token}`;
      setPublicUrl(url);
      setShowSuccessDialog(true);
      setCopied(false);

    } catch (error) {
      console.error("Error creating consent form entity:", error);
      setError(error.message || "אירעה שגיאה ביצירת הטופס. אנא נסה שוב.");
      toast({
        title: "שגיאה ביצירת טופס",
        description: error.message || "אירעה שגיאה",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = formData.ownerName && formData.petName && formData.procedureType && formData.procedureDate && formData.clinicId;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("ConsentForms"))}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
            aria-label="חזרה לרשימת טפסי הסכמה"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">יצירת טופס הכנה לניתוח חדש</h1>
            <p className="text-slate-600 mt-2">מלאו את הפרטים להליך הרפואי, ולאחר מכן שלחו את הקישור ללקוח</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* פרטי הטופס */}
          <Card className="bg-white/90 backdrop-blur-sm border-blue-100 shadow-xl mb-6">
            <CardHeader className="border-b border-blue-100">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-purple-500" />
                פרטי ההליך הרפואי
              </CardTitle>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
              {currentUser?.role === 'admin' && (
                <div>
                  <Label htmlFor="clinic-select" className="text-base font-medium text-slate-700">בחירת סניף המרפאה *</Label>
                  <Select 
                    value={formData.clinicId}
                    onValueChange={(value) => updateFormData('clinicId', value)}
                    disabled={clinics.length === 0}
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

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="owner-name" className="text-base font-medium text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    שם הבעלים *
                  </Label>
                  <Input 
                    id="owner-name"
                    value={formData.ownerName} 
                    onChange={(e) => updateFormData('ownerName', e.target.value)} 
                    className="mt-2" 
                    placeholder="הכניסו את שם הבעלים המלא" 
                    required 
                    aria-required="true"
                  />
                </div>
                <div>
                  <Label htmlFor="owner-id" className="text-base font-medium text-slate-700">מס׳ תעודת זהות</Label>
                  <Input 
                    id="owner-id"
                    value={formData.ownerId} 
                    onChange={(e) => updateFormData('ownerId', e.target.value)} 
                    className="mt-2" 
                    placeholder="מספר תעודת זהות" 
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="owner-email" className="text-base font-medium text-slate-700">כתובת מייל הלקוח</Label>
                  <Input 
                    id="owner-email"
                    type="email" 
                    value={formData.ownerEmail} 
                    onChange={(e) => updateFormData('ownerEmail', e.target.value)} 
                    className="mt-2" 
                    placeholder="example@email.com" 
                  />
                </div>
                <div>
                  <Label htmlFor="owner-phone" className="text-base font-medium text-slate-700">טלפון הלקוח</Label>
                  <Input 
                    id="owner-phone"
                    type="tel" 
                    value={formData.ownerPhone} 
                    onChange={(e) => updateFormData('ownerPhone', e.target.value)} 
                    className="mt-2" 
                    placeholder="05X-XXXXXXX" 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="owner-address" className="text-base font-medium text-slate-700">כתובת מלאה</Label>
                <Input 
                  id="owner-address"
                  value={formData.ownerAddress} 
                  onChange={(e) => updateFormData('ownerAddress', e.target.value)} 
                  className="mt-2" 
                  placeholder="רחוב, מספר בית, עיר" 
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="pet-name" className="text-base font-medium text-slate-700 flex items-center gap-2">
                    <PawPrint className="w-4 h-4 text-orange-500" />
                    שם חיית המחמד *
                  </Label>
                  <Input 
                    id="pet-name"
                    value={formData.petName} 
                    onChange={(e) => updateFormData('petName', e.target.value)} 
                    className="mt-2" 
                    placeholder="שם חיית המחמד" 
                    required 
                    aria-required="true"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="procedure-date" className="text-base font-medium text-slate-700 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-green-500" />
                    תאריך ההליך *
                  </Label>
                  <Input 
                    id="procedure-date"
                    type="date" 
                    value={formData.procedureDate} 
                    onChange={(e) => updateFormData('procedureDate', e.target.value)} 
                    className="mt-2" 
                    required 
                    aria-required="true"
                  />
                </div>
                <div>
                  <Label htmlFor="procedure-type" className="text-base font-medium text-slate-700 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-purple-500" />
                    סוג ההליך המתוכנן *
                  </Label>
                  <Input 
                    id="procedure-type"
                    value={formData.procedureType} 
                    onChange={(e) => updateFormData('procedureType', e.target.value)} 
                    className="mt-2" 
                    placeholder="לדוגמה: ניקוי שיניים, סירוס, עיקור" 
                    required 
                    aria-required="true"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="clinic-notes" className="text-base font-medium text-slate-700">הערות נוספות מהמרפאה</Label>
                <p className="text-sm text-slate-500 mt-1 mb-2">הטקסט הזה יוצג ללקוח בטופס ההסכמה.</p>
                <Textarea 
                  id="clinic-notes"
                  value={formData.clinicNotes} 
                  onChange={(e) => updateFormData('clinicNotes', e.target.value)} 
                  className="mt-2" 
                  rows={4} 
                  placeholder="לדוגמה: חשוב לשמור על צום 12 שעות של אוכל..." 
                />
              </div>
            </CardContent>
          </Card>

          {/* הצעת מחיר */}
          <Card className="bg-white/90 backdrop-blur-sm border-yellow-100 shadow-xl mb-6">
            <CardHeader className="border-b border-yellow-100 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-yellow-600" />
                הצעת מחיר (אופציונלי)
              </CardTitle>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-slate-600">הוסף טיפולים ומחירים שיוצגו בטופס ההסכמה</p>
                <Button
                  type="button"
                  onClick={addTreatment}
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  aria-label="הוסף טיפול חדש להצעת המחיר"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  הוסף טיפול
                </Button>
              </div>

              {formData.treatmentCosts.length > 0 && (
                <div className="space-y-3">
                  {formData.treatmentCosts.map((treatment, index) => (
                    <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <Input
                          placeholder="שם הטיפול (לדוגמה: ניקוי שיניים)"
                          value={treatment.treatment_name}
                          onChange={(e) => updateTreatment(index, 'treatment_name', e.target.value)}
                          className="mb-2"
                          aria-label={`שם טיפול ${index + 1}`}
                        />
                        <Input
                          type="number"
                          placeholder="עלות (₪)"
                          value={treatment.cost}
                          onChange={(e) => updateTreatment(index, 'cost', e.target.value)}
                          aria-label={`עלות טיפול ${index + 1}`}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTreatment(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        aria-label={`מחק טיפול ${index + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-300 mt-4" role="status" aria-live="polite">
                    <span className="text-lg font-bold text-gray-900">סה״כ:</span>
                    <span className="text-2xl font-bold text-green-700">₪{formData.totalCost.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {formData.treatmentCosts.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>לא הוספת טיפולים עדיין</p>
                  <p className="text-sm">לחץ על "הוסף טיפול" כדי להתחיל</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* כפתורי פעולה */}
          <div className="border-t border-blue-100 p-6 flex justify-end gap-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(createPageUrl("ConsentForms"))} 
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
                  יוצר טופס...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 ml-2" />
                  צור טופס וקבל קישור
                </>
              )}
            </Button>
          </div>
        </form>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-center" role="alert">
            {error}
          </div>
        )}
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>טופס הכנה נוצר בהצלחה!</DialogTitle>
            <DialogDescription>
              הטופס עבור {formData.petName} ו-{formData.ownerName} נוצר בהצלחה. 
              הקישור הישיר לטופס נמצא למטה.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link" className="text-right">
                קישור
              </Label>
              <Input
                id="link"
                value={publicUrl}
                readOnly
                className="col-span-3"
                aria-label="קישור לטופס"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyLink}
              disabled={copied}
            >
              {copied ? <Check className="ml-2 h-4 w-4" /> : <Copy className="ml-2 h-4 w-4" />}
              {copied ? "הועתק!" : "העתק קישור"}
            </Button>
            <Button 
              type="button" 
              onClick={() => {
                setShowSuccessDialog(false);
                navigate(createPageUrl("ConsentForms"));
              }}
            >
              סגור ופנה לרשימת טפסים
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}