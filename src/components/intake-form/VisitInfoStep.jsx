import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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