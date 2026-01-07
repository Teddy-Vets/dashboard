import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

export default function VisitInfoStepRu({ formData, updateFormData }) {
  return (
    <div className="space-y-8">
      {/* Основная причина визита */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-700 flex items-center gap-2">
          <span className="text-red-500">*</span>
          Какова основная причина визита?
        </Label>
        <p className="text-sm text-slate-500">
          Например: Плановый осмотр, прививки, медицинская проблема
        </p>
        <Textarea
          value={formData.visitReasonMain}
          onChange={(e) => updateFormData("visitReasonMain", e.target.value)}
          placeholder="Опишите основную причину визита..."
          className="h-32 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
          required
        />
      </div>

      {/* Вопрос о страховании */}
      <div className="space-y-4 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200 shadow-sm">
        <Label className="text-base font-medium text-slate-800">
          У вас есть страховка?
        </Label>
        <RadioGroup
          value={formData.hasInsurance}
          onValueChange={(value) => updateFormData("hasInsurance", value)}
          className="space-y-3"
        >
          <div className="flex items-center justify-start space-x-2 bg-white p-4 rounded-lg border border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
            <RadioGroupItem value="yes" id="insurance-yes" />
            <Label
              htmlFor="insurance-yes"
              className="cursor-pointer font-normal flex-1 text-left"
            >
              Да
            </Label>
          </div>
          <div className="flex items-center justify-start space-x-2 bg-white p-4 rounded-lg border border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
            <RadioGroupItem value="no" id="insurance-no" />
            <Label
              htmlFor="insurance-no"
              className="cursor-pointer font-normal flex-1 text-left"
            >
              Нет
            </Label>
          </div>
        </RadioGroup>

        {/* Условный вопрос - если да */}
        {formData.hasInsurance === "yes" && (
          <div className="mt-4 space-y-3">
            <Label className="text-base font-medium text-slate-800">
              Какая?
            </Label>
            <Input
              value={formData.insuranceCompanyName}
              onChange={(e) => updateFormData("insuranceCompanyName", e.target.value)}
              placeholder="Название страховой компании"
              className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
        )}
      </div>

      {/* Дополнительные темы для обсуждения */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-800">
          Дополнительные темы для обсуждения
        </Label>
        <p className="text-sm text-slate-500">
          Есть ли другие темы, которые вы хотели бы обсудить? Вопросы, опасения и т.д.
        </p>
        <Textarea
          value={formData.otherTopics}
          onChange={(e) => updateFormData("otherTopics", e.target.value)}
          placeholder="Дополнительные темы..."
          className="h-32 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
        />
      </div>
    </div>
  );
}