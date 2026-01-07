import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

export default function VisitInfoStepEn({ formData, updateFormData }) {
  return (
    <div className="space-y-8">
      {/* Main Reason for Visit */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-700 flex items-center gap-2">
          <span className="text-red-500">*</span>
          What is the main reason for the visit?
        </Label>
        <p className="text-sm text-slate-500">
          e.g., Routine checkup, vaccinations, medical issue
        </p>
        <Textarea
          value={formData.visitReasonMain}
          onChange={(e) => updateFormData("visitReasonMain", e.target.value)}
          placeholder="Describe the main reason for the visit..."
          className="h-32 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
          required
        />
      </div>

      {/* Insurance Question */}
      <div className="space-y-4 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200 shadow-sm">
        <Label className="text-base font-medium text-slate-800">
          Do you have insurance?
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
              Yes
            </Label>
          </div>
          <div className="flex items-center justify-start space-x-2 bg-white p-4 rounded-lg border border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
            <RadioGroupItem value="no" id="insurance-no" />
            <Label
              htmlFor="insurance-no"
              className="cursor-pointer font-normal flex-1 text-left"
            >
              No
            </Label>
          </div>
        </RadioGroup>

        {/* Conditional question - if yes */}
        {formData.hasInsurance === "yes" && (
          <div className="mt-4 space-y-3">
            <Label className="text-base font-medium text-slate-800">
              Which one?
            </Label>
            <Input
              value={formData.insuranceCompanyName}
              onChange={(e) => updateFormData("insuranceCompanyName", e.target.value)}
              placeholder="Insurance company name"
              className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
        )}
      </div>

      {/* Additional Topics */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-800">
          Additional Topics for Discussion
        </Label>
        <p className="text-sm text-slate-500">
          Are there any other topics you'd like to discuss? Questions, concerns, etc.
        </p>
        <Textarea
          value={formData.otherTopics}
          onChange={(e) => updateFormData("otherTopics", e.target.value)}
          placeholder="Additional topics..."
          className="h-32 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
        />
      </div>
    </div>
  );
}