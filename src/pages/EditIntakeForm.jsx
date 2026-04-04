import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { IntakeForm } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowRight, Save, AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { createPageUrl, copyToClipboard } from "@/components/utils/urlHelpers";
import { getEntityById, updateEntity } from "@/components/utils/apiHelpers";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { createFormLink } from "@/functions/createFormLink";

export default function EditIntakeForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [successLink, setSuccessLink] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const id = urlParams.get("id");
    if (id) loadForm(id);
  }, []);

  const loadForm = async (id) => {
    setIsLoading(true);
    const data = await getEntityById(IntakeForm, id, "IntakeForm");
    setForm(data);
    setFormData({
      owner_name: data.owner_name || "",
      owner_phone: data.owner_phone || "",
      owner_email: data.owner_email || "",
      address: data.address || "",
      pet_name: data.pet_name || "",
      pet_type: data.pet_type || "",
      pet_breed: data.pet_breed || "",
      pet_age: data.pet_age || "",
      pet_gender: data.pet_gender || "",
      visit_reason_main: data.visit_reason_main || "",
      visit_reason_details: data.visit_reason_details || "",
    });
    setIsLoading(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // עדכון הטופס ואיפוס לסטטוס draft (ממתין למילוי מחדש)
    await updateEntity(IntakeForm, form.id, {
      ...formData,
      status: "draft",
    }, "IntakeForm");

    // יצירת קישור ציבורי חדש
    const linkResponse = await createFormLink({
      form_type: "intake",
      clinic_id: form.clinic_id,
      form_id: form.id,
      metadata: {
        owner_name: formData.owner_name,
        pet_name: formData.pet_name,
      }
    });
    const token = linkResponse.data?.token;
    if (token) {
      setSuccessLink(`${window.location.origin}/PublicForm?t=${token}`);
    }
    setIsSaving(false);
  };

  const handleCopy = () => {
    copyToClipboard(successLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="xl" /></div>;

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(createPageUrl("IntakeFormsList"))}>
            <ArrowRight className="w-4 h-4 ml-2" />
            חזור
          </Button>
          <h1 className="text-2xl font-bold text-slate-800">עריכת טופס היכרות</h1>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">שים לב</p>
            <p className="text-sm text-amber-700">לאחר השמירה, הטופס יחזור לסטטוס "נשלח" ויופק קישור חדש לשליחה ללקוח.</p>
          </div>
        </div>

        {/* Form Fields */}
        <Card className="bg-white shadow-lg">
          <CardHeader><CardTitle>פרטי בעלים</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>שם הבעלים</Label>
              <Input value={formData.owner_name} onChange={e => handleChange("owner_name", e.target.value)} />
            </div>
            <div>
              <Label>טלפון</Label>
              <Input value={formData.owner_phone} onChange={e => handleChange("owner_phone", e.target.value)} />
            </div>
            <div>
              <Label>אימייל</Label>
              <Input value={formData.owner_email} onChange={e => handleChange("owner_email", e.target.value)} />
            </div>
            <div>
              <Label>כתובת</Label>
              <Input value={formData.address} onChange={e => handleChange("address", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader><CardTitle>פרטי חיית המחמד</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>שם חיית המחמד</Label>
              <Input value={formData.pet_name} onChange={e => handleChange("pet_name", e.target.value)} />
            </div>
            <div>
              <Label>סוג</Label>
              <Input value={formData.pet_type} onChange={e => handleChange("pet_type", e.target.value)} />
            </div>
            <div>
              <Label>גזע</Label>
              <Input value={formData.pet_breed} onChange={e => handleChange("pet_breed", e.target.value)} />
            </div>
            <div>
              <Label>גיל</Label>
              <Input value={formData.pet_age} onChange={e => handleChange("pet_age", e.target.value)} />
            </div>
            <div>
              <Label>מין</Label>
              <Input value={formData.pet_gender} onChange={e => handleChange("pet_gender", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader><CardTitle>סיבת הביקור</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>סיבה עיקרית</Label>
              <Input value={formData.visit_reason_main} onChange={e => handleChange("visit_reason_main", e.target.value)} />
            </div>
            <div>
              <Label>פרטים נוספים</Label>
              <Textarea value={formData.visit_reason_details} onChange={e => handleChange("visit_reason_details", e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
          שמור ויצור קישור חדש
        </Button>
      </div>

      {/* Success Dialog */}
      <Dialog open={!!successLink} onOpenChange={() => { setSuccessLink(null); navigate(createPageUrl("IntakeFormsList")); }}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>הטופס עודכן בהצלחה!</DialogTitle>
            <DialogDescription>הקישור החדש מוכן לשליחה ללקוח.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Input value={successLink || ""} readOnly className="flex-1" />
            <Button variant="outline" onClick={handleCopy}>{copied ? "הועתק!" : "העתק"}</Button>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(successLink)}`, "_blank")} disabled={!successLink}>
              שתף בוואטסאפ
            </Button>
            <Button variant="outline" onClick={() => { setSuccessLink(null); navigate(createPageUrl("IntakeFormsList")); }}>סגור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}