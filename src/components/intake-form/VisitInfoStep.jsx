import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

export default function VisitInfoStep({ formData, updateFormData }) {
  return (
    <div className="space-y-8">
      {/* סיבת הביקור העיקרית */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-700 flex items-center gap-2">
          <span className="text-red-500">*</span>
          מה הסיבה העיקרית לביקור?
        </Label>
        <p className="text-sm text-slate-500">
          לדוגמה: בדיקת שגרה, חיסונים, בעיה רפואית
        </p>
        <Textarea
          value={formData.visitReasonMain}
          onChange={(e) => updateFormData("visitReasonMain", e.target.value)}
          placeholder="תארו את הסיבה העיקרית לביקור..."
          className="h-32 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
          required
        />
      </div>

      {/* שאלת ביטוח */}
      <div className="space-y-4 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200 shadow-sm">
        <Label className="text-base font-medium text-slate-800">
          האם יש לכם ביטוח?
        </Label>
        <RadioGroup
          value={formData.hasInsurance}
          onValueChange={(value) => updateFormData("hasInsurance", value)}
          className="space-y-3"
        >
          <div className="flex items-center justify-end space-x-2 space-x-reverse bg-white p-4 rounded-lg border border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
            <Label
              htmlFor="insurance-yes"
              className="cursor-pointer font-normal flex-1 text-right"
            >
              כן
            </Label>
            <RadioGroupItem value="yes" id="insurance-yes" />
          </div>
          <div className="flex items-center justify-end space-x-2 space-x-reverse bg-white p-4 rounded-lg border border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
            <Label
              htmlFor="insurance-no"
              className="cursor-pointer font-normal flex-1 text-right"
            >
              לא
            </Label>
            <RadioGroupItem value="no" id="insurance-no" />
          </div>
        </RadioGroup>

        {/* שאלה מותנית - אם כן */}
        {formData.hasInsurance === "yes" && (
          <div className="mt-4 space-y-3">
            <Label className="text-base font-medium text-slate-800">
              איזה?
            </Label>
            <Input
              value={formData.insuranceCompanyName}
              onChange={(e) => updateFormData("insuranceCompanyName", e.target.value)}
              placeholder="שם חברת הביטוח"
              className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
        )}
      </div>

      {/* נושאים נוספים לדיון */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-800">
          נושאים נוספים לדיון
        </Label>
        <p className="text-sm text-slate-500">
          האם יש נושאים נוספים שהרצו לדון בהם? תשוות, שאלות וכו׳
        </p>
        <Textarea
          value={formData.otherTopics}
          onChange={(e) => updateFormData("otherTopics", e.target.value)}
          placeholder="נושאים נוספים..."
          className="h-32 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
        />
      </div>
    </div>
  );
}