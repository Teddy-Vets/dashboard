import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function VisitInfoStepFr({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="visitReasonMain" className="text-base font-medium text-slate-700 mb-2 block">
          Raison principale de la visite *
        </Label>
        <p className="text-sm text-slate-600 mb-3">
          Pourquoi venez-vous nous voir aujourd'hui ?
        </p>
        <Textarea
          id="visitReasonMain"
          value={formData.visitReasonMain}
          onChange={(e) => updateFormData("visitReasonMain", e.target.value)}
          placeholder="Par exemple : Vaccination annuelle, problème de santé, contrôle de routine..."
          className="mt-1"
          rows={3}
          required
        />
      </div>

      <div>
        <Label htmlFor="visitReasonDetails" className="text-base font-medium text-slate-700 mb-2 block">
          Détails supplémentaires (optionnel)
        </Label>
        <Textarea
          id="visitReasonDetails"
          value={formData.visitReasonDetails}
          onChange={(e) => updateFormData("visitReasonDetails", e.target.value)}
          placeholder="Plus de détails sur la raison de la visite..."
          className="mt-1"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="otherTopics" className="text-base font-medium text-slate-700 mb-2 block">
          Autres sujets à discuter (optionnel)
        </Label>
        <p className="text-sm text-slate-600 mb-3">
          Y a-t-il quelque chose d'autre que vous aimeriez aborder pendant la visite ?
        </p>
        <Textarea
          id="otherTopics"
          value={formData.otherTopics}
          onChange={(e) => updateFormData("otherTopics", e.target.value)}
          placeholder="Comportement, nutrition, questions générales..."
          className="mt-1"
          rows={4}
        />
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          ℹ️ Après avoir soumis le formulaire, un représentant de la clinique vous contactera pour confirmer la visite et répondre à toutes vos questions.
        </p>
      </div>
    </div>
  );
}