import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

export default function MedicalHistoryStepAr({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium text-slate-700 mb-4 block">
          هل هذه أول زيارة للطبيب البيطري؟ *
        </Label>
        <RadioGroup
          value={formData.firstVisit}
          onValueChange={(value) => updateFormData("firstVisit", value)}
          className="space-y-3"
        >
          <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <RadioGroupItem value="yes" id="first-visit-yes-ar" />
            <Label htmlFor="first-visit-yes-ar" className="flex-1 cursor-pointer font-normal">
              نعم، أول زيارة
            </Label>
          </div>
          <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <RadioGroupItem value="no" id="first-visit-no-ar" />
            <Label htmlFor="first-visit-no-ar" className="flex-1 cursor-pointer font-normal">
              لا، زرنا طبيباً بيطرياً من قبل
            </Label>
          </div>
        </RadioGroup>

        {formData.firstVisit === "yes" && (
          <div className="mt-4">
            <Label htmlFor="howHeardAboutUs" className="text-sm font-medium text-slate-700 mb-2 block">
              كيف سمعت عنا؟
            </Label>
            <Input
              id="howHeardAboutUs"
              value={formData.howHeardAboutUs}
              onChange={(e) => updateFormData("howHeardAboutUs", e.target.value)}
              placeholder="جوجل، توصية من صديق، إلخ."
              className="mt-1"
            />
          </div>
        )}

        {formData.firstVisit === "no" && (
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="previousClinicName" className="text-sm font-medium text-slate-700 mb-2 block">
                اسم العيادة/الطبيب البيطري السابق
              </Label>
              <Input
                id="previousClinicName"
                value={formData.previousClinicName}
                onChange={(e) => updateFormData("previousClinicName", e.target.value)}
                placeholder="اسم العيادة"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="previousPetName" className="text-sm font-medium text-slate-700 mb-2 block">
                هل تم علاجك معنا من قبل؟ إذا نعم، ما كان اسم الحيوان؟
              </Label>
              <Input
                id="previousPetName"
                value={formData.previousPetName}
                onChange={(e) => updateFormData("previousPetName", e.target.value)}
                placeholder="اسم الحيوان السابق"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="prevVetLikes" className="text-sm font-medium text-slate-700 mb-2 block">
                ما الذي أعجبك في طبيبك البيطري السابق؟
              </Label>
              <Textarea
                id="prevVetLikes"
                value={formData.prevVetLikes}
                onChange={(e) => updateFormData("prevVetLikes", e.target.value)}
                placeholder="ما كان جيداً..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="needsFromUs" className="text-sm font-medium text-slate-700 mb-2 block">
                ما الذي تتوقعه منا؟
              </Label>
              <Textarea
                id="needsFromUs"
                value={formData.needsFromUs}
                onChange={(e) => updateFormData("needsFromUs", e.target.value)}
                placeholder="كيف يمكننا خدمتك بشكل أفضل..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-200">
        <Label htmlFor="knownMedicalIssues" className="text-base font-medium text-slate-700 mb-2 block">
          مشاكل طبية أو سلوكية معروفة (اختياري)
        </Label>
        <Textarea
          id="knownMedicalIssues"
          value={formData.knownMedicalIssues}
          onChange={(e) => updateFormData("knownMedicalIssues", e.target.value)}
          placeholder="أمراض، حساسية، مشاكل سلوكية..."
          className="mt-1"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="dietFoodType" className="text-base font-medium text-slate-700 mb-2 block">
          نوع الطعام وعادات الأكل (اختياري)
        </Label>
        <Textarea
          id="dietFoodType"
          value={formData.dietFoodType}
          onChange={(e) => updateFormData("dietFoodType", e.target.value)}
          placeholder="نوع الطعام، تكرار الوجبات..."
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="pt-4 border-t border-slate-200">
        <Label className="text-base font-medium text-slate-700 mb-4 block">
          مستوى القلق عند زيارة الطبيب البيطري *
        </Label>
        <p className="text-sm text-slate-600 mb-4">
          على مقياس من 1 إلى 10، كم يكون حيوانك الأليف قلقاً عند زيارة الطبيب البيطري؟
        </p>
        
        <div className="space-y-4">
          <Slider
            value={[formData.vetAnxietyLevel]}
            onValueChange={(value) => updateFormData("vetAnxietyLevel", value[0])}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
          
          <div className="flex justify-between text-sm">
            <span className="text-green-600 font-medium">1 - هادئ</span>
            <span className="text-blue-600 font-bold text-lg">{formData.vetAnxietyLevel}</span>
            <span className="text-red-600 font-medium">10 - قلق جداً</span>
          </div>
        </div>

        {formData.vetAnxietyLevel >= 5 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <Label htmlFor="anxietyHelpSuggestions" className="text-sm font-medium text-amber-800 mb-2 block">
              💡 اقتراحات لتقليل التوتر (اختياري)
            </Label>
            <Textarea
              id="anxietyHelpSuggestions"
              value={formData.anxietyHelpSuggestions}
              onChange={(e) => updateFormData("anxietyHelpSuggestions", e.target.value)}
              placeholder="ما الذي يساعد حيوانك على الهدوء؟ مكافآت، ألعاب، بيئة هادئة..."
              className="mt-2 bg-white"
              rows={3}
            />
          </div>
        )}
      </div>
    </div>
  );
}