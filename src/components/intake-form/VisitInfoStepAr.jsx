import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function VisitInfoStepAr({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="visitReasonMain" className="text-base font-medium text-slate-700 mb-2 block">
          السبب الرئيسي للزيارة *
        </Label>
        <p className="text-sm text-slate-600 mb-3">
          لماذا تأتون لزيارتنا اليوم؟
        </p>
        <Textarea
          id="visitReasonMain"
          value={formData.visitReasonMain}
          onChange={(e) => updateFormData("visitReasonMain", e.target.value)}
          placeholder="مثلاً: تطعيم سنوي، مشكلة صحية، فحص روتيني..."
          className="mt-1"
          rows={3}
          required
        />
      </div>

      <div>
        <Label htmlFor="visitReasonDetails" className="text-base font-medium text-slate-700 mb-2 block">
          تفاصيل إضافية (اختياري)
        </Label>
        <Textarea
          id="visitReasonDetails"
          value={formData.visitReasonDetails}
          onChange={(e) => updateFormData("visitReasonDetails", e.target.value)}
          placeholder="مزيد من التفاصيل حول سبب الزيارة..."
          className="mt-1"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="otherTopics" className="text-base font-medium text-slate-700 mb-2 block">
          مواضيع أخرى للمناقشة (اختياري)
        </Label>
        <p className="text-sm text-slate-600 mb-3">
          هل هناك أي شيء آخر تود مناقشته خلال الزيارة؟
        </p>
        <Textarea
          id="otherTopics"
          value={formData.otherTopics}
          onChange={(e) => updateFormData("otherTopics", e.target.value)}
          placeholder="السلوك، التغذية، أسئلة عامة..."
          className="mt-1"
          rows={4}
        />
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          ℹ️ بعد إرسال النموذج، سيتصل بك ممثل عن العيادة لتأكيد الزيارة والإجابة على جميع أسئلتك.
        </p>
      </div>
    </div>
  );
}