import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, Save, PawPrint, User, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import userService from "@/components/services/userService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PLANS = [
  { value: "teddy_basic", label: "טדי בייסיק", subtitle: "כלבים", monthly: 89, annual: 82 },
  { value: "teddy_plus", label: "טדי פלוס", subtitle: "כלבים", monthly: 129, annual: 118 },
  { value: "teddy_platinum", label: "טדי פלטינום", subtitle: "כלבים", monthly: 169, annual: 155 },
  { value: "teddy_royal", label: "טדי רויאל", subtitle: "חתולים", monthly: 79, annual: 72 },
  { value: "teddy_insured", label: "טדי בטוח", subtitle: "לבעלי ביטוח פרטי", monthly: 79, annual: 72 },
];

const PET_TYPE_EMOJIS = { "כלב": "🐶", "חתול": "🐱", "אחר": "🦜" };

export default function CreateSubscriptionAgreementPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    owner_name: "",
    owner_id_number: "",
    owner_address: "",
    owner_email: "",
    owner_phone: "",
    pet_name: "",
    pet_type: "כלב",
    pet_breed: "",
    pet_microchip: "",
    selected_plan: "teddy_basic",
    payment_frequency: "monthly",
  });

  useEffect(() => {
    userService.getCurrentUser().then(user => {
      setCurrentUser(user);
      if (user?.role === 'admin') {
        base44.entities.Clinic.list().then(setClinics).catch(() => {});
      }
    });
  }, []);

  const handleChange = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const handleSave = async () => {
    if (!form.owner_name || !form.pet_name || !form.selected_plan) {
      alert("יש למלא שם לקוח, שם חיה ומסלול.");
      return;
    }
    const clinic_id = currentUser?.role === 'admin' ? form.clinic_id : (currentUser?.clinic_id || currentUser?.id);
    if (!clinic_id) {
      alert("יש לבחור מרפאה.");
      return;
    }
    setIsSaving(true);
    try {
      await base44.entities.SubscriptionAgreement.create({
        ...form,
        clinic_id,
        status: "pending",
      });
      navigate("/SubscriptionAgreements");
    } catch (e) {
      console.error(e);
      alert("שגיאה בשמירה. נסו שוב.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedPlan = PLANS.find(p => p.value === form.selected_plan);

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen" dir="rtl" style={{direction: 'rtl', textAlign: 'right'}}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link to="/SubscriptionAgreements">
            <Button variant="ghost" size="icon"><ArrowRight className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">הסכם הצטרפות חדש</h1>
            <p className="text-sm text-slate-500">יצירת הסכם הצטרפות לתוכנית המנויים</p>
          </div>
        </div>

        {/* Clinic Selector - admin only */}
        {currentUser?.role === 'admin' && (
          <Card className="bg-white shadow">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">🏥 בחירת מרפאה</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Label>מרפאה *</Label>
              <Select value={form.clinic_id || ""} onValueChange={v => handleChange('clinic_id', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="בחר מרפאה..." />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Client Details */}
        <Card className="bg-white shadow">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg"><User className="w-5 h-5 text-blue-500" />פרטי הלקוח</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid md:grid-cols-2 gap-4">
            <div>
              <Label>שם מלא *</Label>
              <Input value={form.owner_name} onChange={e => handleChange('owner_name', e.target.value)} placeholder="שם הלקוח" className="mt-1" />
            </div>
            <div>
              <Label>תעודת זהות</Label>
              <Input value={form.owner_id_number} onChange={e => handleChange('owner_id_number', e.target.value)} placeholder="מספר ת.ז." className="mt-1" />
            </div>
            <div>
              <Label>טלפון</Label>
              <Input value={form.owner_phone} onChange={e => handleChange('owner_phone', e.target.value)} placeholder="מספר טלפון" className="mt-1" />
            </div>
            <div>
              <Label>אימייל</Label>
              <Input value={form.owner_email} onChange={e => handleChange('owner_email', e.target.value)} placeholder="כתובת מייל" className="mt-1" />
            </div>
            <div className="md:col-span-2">
              <Label>כתובת</Label>
              <Input value={form.owner_address} onChange={e => handleChange('owner_address', e.target.value)} placeholder="כתובת מגורים" className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Pet Details */}
        <Card className="bg-white shadow">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg"><PawPrint className="w-5 h-5 text-orange-500" />פרטי חיית המחמד</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid md:grid-cols-2 gap-4">
            <div>
              <Label>שם החיה *</Label>
              <Input value={form.pet_name} onChange={e => handleChange('pet_name', e.target.value)} placeholder="שם חיית המחמד" className="mt-1" />
            </div>
            <div>
              <Label>סוג</Label>
              <RadioGroup value={form.pet_type} onValueChange={v => handleChange('pet_type', v)} className="flex gap-4 mt-2">
                {["אחר", "חתול", "כלב"].map(t => (
                  <div key={t} className="flex items-center gap-2">
                    <RadioGroupItem value={t} id={`pet-${t}`} />
                    <Label htmlFor={`pet-${t}`} className="cursor-pointer">{PET_TYPE_EMOJIS[t]} {t}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label>גזע (אופציונלי)</Label>
              <Input value={form.pet_breed} onChange={e => handleChange('pet_breed', e.target.value)} placeholder="גזע החיה" className="mt-1" />
            </div>
            <div>
              <Label>מספר שבב (אם קיים)</Label>
              <Input value={form.pet_microchip} onChange={e => handleChange('pet_microchip', e.target.value)} placeholder="מספר שבב" className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Plan Selection */}
        <Card className="bg-white shadow">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg"><CreditCard className="w-5 h-5 text-purple-500" />בחירת מסלול</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {PLANS.map(plan => (
                <div
                  key={plan.value}
                  onClick={() => handleChange('selected_plan', plan.value)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${form.selected_plan === plan.value ? 'border-purple-400 bg-purple-50' : 'border-slate-200 hover:border-purple-200'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{plan.label}</p>
                      <p className="text-sm text-slate-500">{plan.subtitle}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-slate-600">חודשי: <span className="font-bold">₪{plan.monthly}</span></p>
                      <p className="text-sm text-slate-500">שנתי: <span className="font-semibold">₪{plan.annual}/חודש</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Label className="text-base font-semibold">תדירות תשלום</Label>
              <RadioGroup value={form.payment_frequency} onValueChange={v => handleChange('payment_frequency', v)} className="flex flex-col gap-3 mt-2 items-end">
                <div className="flex items-center gap-2 flex-row-reverse justify-end w-full">
                  <Label htmlFor="pay-monthly" className="cursor-pointer">הוראת קבע חודשית</Label>
                  <RadioGroupItem value="monthly" id="pay-monthly" />
                </div>
                <div className="flex items-center gap-2 flex-row-reverse justify-end w-full">
                  <Label htmlFor="pay-annual" className="cursor-pointer">תשלום שנתי מראש (חודש מתנה)</Label>
                  <RadioGroupItem value="annual" id="pay-annual" />
                </div>
              </RadioGroup>
            </div>

            {selectedPlan && (
              <div className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p className="font-bold text-purple-800">{selectedPlan.label} · {form.payment_frequency === 'annual' ? 'שנתי' : 'חודשי'}</p>
                <p className="text-purple-700 text-lg font-bold mt-1">
                  ₪{form.payment_frequency === 'annual' ? selectedPlan.annual : selectedPlan.monthly} לחודש
                  {form.payment_frequency === 'annual' && <span className="text-sm font-normal mr-2">(סה״כ ₪{selectedPlan.annual * 11} לשנה)</span>}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex gap-3 pb-6">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 text-lg">
            {isSaving ? "שומר..." : <><Save className="ml-2 w-5 h-5" />שמור וצור הסכם</>}
          </Button>
          <Link to="/SubscriptionAgreements">
            <Button variant="outline" className="py-6">ביטול</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}