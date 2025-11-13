import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, Mail, Home, PawPrint, CreditCard } from "lucide-react";

export default function PersonalInfoStep({ formData, updateFormData }) {
  return (
    <div className="space-y-8">
      {/* שם מלא */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-700 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          <span className="text-red-500">*</span>
          שם מלא
        </Label>
        <Input
          value={formData.ownerName}
          onChange={(e) => updateFormData("ownerName", e.target.value)}
          placeholder="מניה נמי"
          className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
          required
        />
      </div>

      {/* תעודת זהות */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-700 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-indigo-500" />
          <span className="text-red-500">*</span>
          תעודת זהות
        </Label>
        <Input
          value={formData.ownerIdNumber}
          onChange={(e) => updateFormData("ownerIdNumber", e.target.value)}
          placeholder="123456789"
          className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
          required
          maxLength={9}
        />
      </div>

      {/* טלפון נייד */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-700 flex items-center gap-2">
          <Phone className="w-4 h-4 text-green-500" />
          <span className="text-red-500">*</span>
          טלפון נייד
        </Label>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) => updateFormData("phone", e.target.value)}
          placeholder="0555"
          className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
          required
        />
      </div>

      {/* כתובת מייל */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-700 flex items-center gap-2">
          <Mail className="w-4 h-4 text-purple-500" />
          כתובת מייל (אופציונלי)
        </Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData("email", e.target.value)}
          placeholder="example@email.com"
          className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
        />
      </div>

      {/* כתובת מגורים */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-700 flex items-center gap-2">
          <Home className="w-4 h-4 text-orange-500" />
          כתובת מגורים
        </Label>
        <Input
          value={formData.address}
          onChange={(e) => updateFormData("address", e.target.value)}
          placeholder="רחוב, מספר בית, עיר"
          className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
        />
      </div>

      {/* חיית מחמד ראשונה */}
      <div className="space-y-4 bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 shadow-sm">
        <Label className="text-base font-medium text-slate-800 flex items-center gap-2">
          <PawPrint className="w-5 h-5 text-green-600" />
          <span className="text-red-500">*</span>
          האם זו חיית המחמד הראשונה שלכם?
        </Label>
        <RadioGroup
          value={formData.firstEverPet}
          onValueChange={(value) => updateFormData("firstEverPet", value)}
          className="space-y-3"
        >
          <div className="flex items-center justify-end space-x-2 space-x-reverse bg-white p-4 rounded-lg border border-green-200 hover:border-green-400 transition-colors cursor-pointer">
            <Label
              htmlFor="first-pet-yes"
              className="cursor-pointer font-normal flex-1 text-right"
            >
              כן, זו הראשונה! 🎉
            </Label>
            <RadioGroupItem value="yes" id="first-pet-yes" />
          </div>
          <div className="flex items-center justify-end space-x-2 space-x-reverse bg-white p-4 rounded-lg border border-green-200 hover:border-green-400 transition-colors cursor-pointer">
            <Label
              htmlFor="first-pet-no"
              className="cursor-pointer font-normal flex-1 text-right"
            >
              לא, יש/היה לנו עוד חבר פרוותי בבית 💚
            </Label>
            <RadioGroupItem value="no" id="first-pet-no" />
          </div>
        </RadioGroup>

        {/* שאלה מותנית - אם כן */}
        {formData.firstEverPet === "yes" && (
          <div className="mt-4 space-y-3 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-lg border border-blue-200 shadow-sm">
            <Label className="text-base font-medium text-slate-800">
              ספרו לנו בבקשה, מי מטפל ודואג?
            </Label>
            <p className="text-sm text-slate-600">
              מי מטפל בעיקר בחיית המחמד? האם כולם בבית מעורבים?
            </p>
            <Textarea
              value={formData.firstPetStory}
              onChange={(e) => updateFormData("firstPetStory", e.target.value)}
              placeholder="ספרו לנו קצת על מי דואג לחבר הפרוותי החדש..."
              className="h-24 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
        )}

        {/* שאלה מותנית - אם לא */}
        {formData.firstEverPet === "no" && (
          <div className="mt-4 space-y-3 bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-lg border border-purple-200 shadow-sm">
            <Label className="text-base font-medium text-slate-800">
              מי דואג לחבר הפרוותי?
            </Label>
            <p className="text-sm text-slate-600">
              ספרו לנו קצת על מי מטפל בעיקר בחיות המחמד שלכם
            </p>
            <Textarea
              value={formData.notFirstPetInfo}
              onChange={(e) => updateFormData("notFirstPetInfo", e.target.value)}
              placeholder="ספרו לנו קצת..."
              className="h-24 bg-white border-slate-200 focus:border-purple-400 focus:ring-purple-400"
            />
          </div>
        )}
      </div>
    </div>
  );
}