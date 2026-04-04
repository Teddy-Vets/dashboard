import React, { useState, useEffect } from "react";
import { ConsentForm, Clinic } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileCheck, User, PawPrint, Stethoscope, Copy, Check, DollarSign, Upload, FileText, AlertTriangle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/components/utils/urlHelpers";
import { createFormLink } from "@/functions/createFormLink";
import { getEntityList, getEntityById } from "@/components/utils/apiHelpers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import userService from "@/components/services/userService";
import { base44 } from "@/api/base44Client";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function EditConsentFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const formId = searchParams.get("id");

  const [formData, setFormData] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [error, setError] = useState('');

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!formId) {
      setError("מזהה טופס חסר");
      setIsLoading(false);
      return;
    }
    loadData();
  }, [formId]);

  const loadData = async () => {
    try {
      const [user, existingForm] = await Promise.all([
        userService.getCurrentUser(),
        getEntityById(ConsentForm, formId, 'ConsentForm')
      ]);

      setCurrentUser(user);

      let activeClinics = [];
      try {
        activeClinics = await getEntityList(Clinic, { is_active: true });
      } catch (e) {
        console.warn("Could not load clinics:", e);
      }
      setClinics(activeClinics);

      setFormData({
        clinicId: existingForm.clinic_id || "",
        ownerName: existingForm.owner_name || "",
        ownerId: existingForm.owner_id || "",
        ownerEmail: existingForm.owner_email || "",
        ownerPhone: existingForm.owner_phone || "",
        ownerAddress: existingForm.owner_address || "",
        petName: existingForm.pet_name || "",
        procedureDate: existingForm.procedure_date || "",
        procedureType: existingForm.procedure_type || "",
        clinicNotes: existingForm.clinic_notes || "",
        quotePdfUrl: existingForm.quote_pdf_url || ""
      });
    } catch (err) {
      console.error("Error loading form:", err);
      setError(err.message || "שגיאה בטעינת הטופס");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePdfUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({ title: "יש להעלות קובץ PDF בלבד", variant: "destructive" });
      return;
    }

    setIsUploadingPdf(true);
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      if (response?.file_url) {
        updateField('quotePdfUrl', response.file_url);
        toast({ title: "הקובץ הועלה בהצלחה!" });
      } else {
        throw new Error("לא התקבל URL מהשרת");
      }
    } catch (err) {
      toast({ title: "שגיאה בהעלאת הקובץ", description: err.message, variant: "destructive" });
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // עדכון הטופס ואיפוס לסטטוס pending
      await ConsentForm.update(formId, {
        clinic_id: formData.clinicId,
        owner_name: formData.ownerName,
        owner_id: formData.ownerId,
        owner_email: formData.ownerEmail,
        owner_phone: formData.ownerPhone,
        owner_address: formData.ownerAddress,
        pet_name: formData.petName,
        procedure_type: formData.procedureType,
        procedure_date: formData.procedureDate,
        clinic_notes: formData.clinicNotes,
        quote_pdf_url: formData.quotePdfUrl,
        // איפוס שדות חתימה
        status: 'pending',
        signature_data: null,
        signature_hash: null,
        form_content_hash: null,
        signature_ip: null,
        signature_user_agent: null,
        signature_timestamp: null,
        signed_at: null,
        immutable_record: false
      });

      // יצירת קישור חדש לחתימה
      const linkResponse = await createFormLink({
        form_type: 'consent',
        clinic_id: formData.clinicId,
        form_id: formId,
        metadata: {
          owner_name: formData.ownerName,
          pet_name: formData.petName,
          procedure_type: formData.procedureType,
        }
      });

      const token = linkResponse.data?.token;
      if (!token) throw new Error("לא התקבל טוקן מהשרת.");

      const url = `${window.location.origin}/PublicConsentForm?t=${token}`;
      setPublicUrl(url);
      setShowSuccessDialog(true);
      setCopied(false);

    } catch (err) {
      console.error("Error updating consent form:", err);
      setError(err.message || "שגיאה בעדכון הטופס. אנא נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast({ title: "הקישור הועתק בהצלחה!" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "שגיאה בהעתקה", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error && !formData) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
        <Button className="mt-4" onClick={() => navigate(createPageUrl("ConsentForms"))}>חזרה לרשימה</Button>
      </div>
    );
  }

  const canSubmit = formData?.ownerName && formData?.petName && formData?.procedureType && formData?.procedureDate && formData?.clinicId;

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
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">עריכת טופס הכנה לניתוח</h1>
            <p className="text-slate-600 mt-2">עדכנו את הפרטים ושלחו קישור חדש ללקוח לחתימה</p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800">שימו לב</p>
            <p className="text-sm text-amber-700 mt-1">
              שמירת העריכה תאפס את חתימת הלקוח ותשנה את סטטוס הטופס ל"ממתין לחתימה". יופק קישור חדש לחתימה חוזרת.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-white/90 backdrop-blur-sm border-blue-100 shadow-xl mb-6">
            <CardHeader className="border-b border-blue-100">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-purple-500" />
                פרטי ההליך הרפואי
              </CardTitle>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
              {currentUser?.role === 'admin' && clinics.length > 0 && (
                <div>
                  <Label className="text-base font-medium text-slate-700">בחירת סניף המרפאה *</Label>
                  <Select value={formData.clinicId} onValueChange={(v) => updateField('clinicId', v)} dir="rtl">
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

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />שם הבעלים *
                  </Label>
                  <Input value={formData.ownerName} onChange={(e) => updateField('ownerName', e.target.value)} className="mt-2" placeholder="שם הבעלים המלא" required />
                </div>
                <div>
                  <Label className="text-base font-medium text-slate-700">מס׳ תעודת זהות</Label>
                  <Input value={formData.ownerId} onChange={(e) => updateField('ownerId', e.target.value)} className="mt-2" placeholder="מספר תעודת זהות" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium text-slate-700">כתובת מייל</Label>
                  <Input type="email" value={formData.ownerEmail} onChange={(e) => updateField('ownerEmail', e.target.value)} className="mt-2" placeholder="example@email.com" />
                </div>
                <div>
                  <Label className="text-base font-medium text-slate-700">טלפון</Label>
                  <Input type="tel" value={formData.ownerPhone} onChange={(e) => updateField('ownerPhone', e.target.value)} className="mt-2" placeholder="05X-XXXXXXX" />
                </div>
              </div>

              <div>
                <Label className="text-base font-medium text-slate-700">כתובת מלאה</Label>
                <Input value={formData.ownerAddress} onChange={(e) => updateField('ownerAddress', e.target.value)} className="mt-2" placeholder="רחוב, מספר בית, עיר" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium text-slate-700 flex items-center gap-2">
                    <PawPrint className="w-4 h-4 text-orange-500" />שם חיית המחמד *
                  </Label>
                  <Input value={formData.petName} onChange={(e) => updateField('petName', e.target.value)} className="mt-2" placeholder="שם חיית המחמד" required />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium text-slate-700 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-green-500" />תאריך ההליך *
                  </Label>
                  <Input type="date" value={formData.procedureDate} onChange={(e) => updateField('procedureDate', e.target.value)} className="mt-2" required />
                </div>
                <div>
                  <Label className="text-base font-medium text-slate-700 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-purple-500" />סוג ההליך *
                  </Label>
                  <Input value={formData.procedureType} onChange={(e) => updateField('procedureType', e.target.value)} className="mt-2" placeholder="לדוגמה: ניקוי שיניים, סירוס" required />
                </div>
              </div>

              <div>
                <Label className="text-base font-medium text-slate-700">הערות מהמרפאה</Label>
                <p className="text-sm text-slate-500 mt-1 mb-2">הטקסט הזה יוצג ללקוח בטופס ההסכמה.</p>
                <Textarea value={formData.clinicNotes} onChange={(e) => updateField('clinicNotes', e.target.value)} className="mt-2" rows={4} />
              </div>
            </CardContent>
          </Card>

          {/* הצעת מחיר */}
          <Card className="bg-white/90 backdrop-blur-sm border-yellow-100 shadow-xl mb-6">
            <CardHeader className="border-b border-yellow-100 bg-gradient-to-r from-yellow-50 to-orange-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                  הצעת מחיר
                </CardTitle>
                <div>
                  <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" id="pdf-upload-edit" />
                  <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('pdf-upload-edit').click()} disabled={isUploadingPdf} className="border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                    {isUploadingPdf ? <><div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin ml-2" />מעלה...</> : <><Upload className="w-4 h-4 ml-2" />העלה PDF</>}
                  </Button>
                </div>
              </div>
              {formData?.quotePdfUrl && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-700">
                  <FileText className="w-4 h-4" />
                  <span>קובץ PDF מצורף</span>
                </div>
              )}
            </CardHeader>
          </Card>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">{error}</div>
          )}

          <div className="border-t border-blue-100 p-6 flex justify-end gap-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl">
            <Button type="button" variant="outline" onClick={() => navigate(createPageUrl("ConsentForms"))}>ביטול</Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              {isSubmitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />שומר...</> : <>שמור ושלח קישור חדש</>}
            </Button>
          </div>
        </form>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>הטופס עודכן בהצלחה!</DialogTitle>
            <DialogDescription>
              הטופס אופס לחתימה חוזרת. שלחו את הקישור החדש ל{formData?.ownerName}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-sm font-medium">קישור לחתימה חוזרת</Label>
            <div className="flex gap-2 mt-2">
              <Input value={publicUrl} readOnly className="flex-1 text-sm" />
              <Button type="button" variant="outline" onClick={handleCopyLink} disabled={copied}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => { setShowSuccessDialog(false); navigate(createPageUrl("ConsentForms")); }}>
              סגור ופנה לרשימה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}