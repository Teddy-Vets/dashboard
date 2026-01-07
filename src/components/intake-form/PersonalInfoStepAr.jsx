import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Phone, Mail, Home, IdCard } from "lucide-react";

export default function PersonalInfoStepAr({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="ownerName" className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          الاسم الكامل *
        </Label>
        <Input
          id="ownerName"
          value={formData.ownerName}
          onChange={(e) => updateFormData("ownerName", e.target.value)}
          placeholder="أدخل اسمك الكامل"
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="ownerIdNumber" className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
          <IdCard className="w-4 h-4 text-blue-500" />
          رقم الهوية *
        </Label>
        <Input
          id="ownerIdNumber"
          value={formData.ownerIdNumber}
          onChange={(e) => updateFormData("ownerIdNumber", e.target.value)}
          placeholder="123456789"
          maxLength={9}
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="phone" className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
          <Phone className="w-4 h-4 text-blue-500" />
          هاتف محمول *
        </Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => updateFormData("phone", e.target.value)}
          placeholder="05X-XXXXXXX"
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="email" className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-500" />
          البريد الإلكتروني (اختياري)
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData("email", e.target.value)}
          placeholder="example@email.com"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="address" className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
          <Home className="w-4 h-4 text-blue-500" />
          عنوان السكن (اختياري)
        </Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => updateFormData("address", e.target.value)}
          placeholder="الشارع، المدينة"
          className="mt-1"
        />
      </div>

      <div className="pt-4 border-t border-slate-200">
        <Label className="text-base font-medium text-slate-700 mb-4 block">
          هل هذا أول حيوان أليف لكم؟ *
        </Label>
        <RadioGroup
          value={formData.firstEverPet}
          onValueChange={(value) => updateFormData("firstEverPet", value)}
          className="space-y-3"
        >
          <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <RadioGroupItem value="yes" id="first-yes-ar" />
            <Label htmlFor="first-yes-ar" className="flex-1 cursor-pointer font-normal">
              نعم، هذا أول حيوان أليف لنا
            </Label>
          </div>
          <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <RadioGroupItem value="no" id="first-no-ar" />
            <Label htmlFor="first-no-ar" className="flex-1 cursor-pointer font-normal">
              لا، لدينا أو كان لدينا حيوانات أليفة أخرى
            </Label>
          </div>
        </RadioGroup>

        {formData.firstEverPet === "yes" && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Label htmlFor="firstPetStory" className="text-sm font-medium text-blue-800 mb-2 block">
              📖 نود كثيراً سماع القصة - كيف وصل أول حيوان أليف إلى عائلتك؟
            </Label>
            <Textarea
              id="firstPetStory"
              value={formData.firstPetStory}
              onChange={(e) => updateFormData("firstPetStory", e.target.value)}
              placeholder="شارك القصة..."
              className="mt-2 bg-white"
              rows={4}
            />
          </div>
        )}

        {formData.firstEverPet === "no" && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Label htmlFor="notFirstPetInfo" className="text-sm font-medium text-blue-800 mb-2 block">
              أخبرنا عن حيواناتك الأليفة ومن يعتني بها بشكل أساسي
            </Label>
            <Textarea
              id="notFirstPetInfo"
              value={formData.notFirstPetInfo}
              onChange={(e) => updateFormData("notFirstPetInfo", e.target.value)}
              placeholder="على سبيل المثال: لدينا كلبان، أنا من يعتني بهما بشكل أساسي..."
              className="mt-2 bg-white"
              rows={4}
            />
          </div>
        )}
      </div>
    </div>
  );
}