import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

export default function MedicalHistoryStepFr({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium text-slate-700 mb-4 block">
          Est-ce la première visite chez un vétérinaire ? *
        </Label>
        <RadioGroup
          value={formData.firstVisit}
          onValueChange={(value) => updateFormData("firstVisit", value)}
          className="space-y-3"
        >
          <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <RadioGroupItem value="yes" id="first-visit-yes-fr" />
            <Label htmlFor="first-visit-yes-fr" className="flex-1 cursor-pointer font-normal">
              Oui, première visite
            </Label>
          </div>
          <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <RadioGroupItem value="no" id="first-visit-no-fr" />
            <Label htmlFor="first-visit-no-fr" className="flex-1 cursor-pointer font-normal">
              Non, nous avons déjà visité un vétérinaire
            </Label>
          </div>
        </RadioGroup>

        {formData.firstVisit === "yes" && (
          <div className="mt-4">
            <Label htmlFor="howHeardAboutUs" className="text-sm font-medium text-slate-700 mb-2 block">
              Comment avez-vous entendu parler de nous ?
            </Label>
            <Input
              id="howHeardAboutUs"
              value={formData.howHeardAboutUs}
              onChange={(e) => updateFormData("howHeardAboutUs", e.target.value)}
              placeholder="Google, recommandation d'un ami, etc."
              className="mt-1"
            />
          </div>
        )}

        {formData.firstVisit === "no" && (
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="previousClinicName" className="text-sm font-medium text-slate-700 mb-2 block">
                Nom de la clinique/vétérinaire précédent
              </Label>
              <Input
                id="previousClinicName"
                value={formData.previousClinicName}
                onChange={(e) => updateFormData("previousClinicName", e.target.value)}
                placeholder="Nom de la clinique"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="previousPetName" className="text-sm font-medium text-slate-700 mb-2 block">
                Avez-vous déjà été traité chez nous ? Si oui, quel était le nom de l'animal ?
              </Label>
              <Input
                id="previousPetName"
                value={formData.previousPetName}
                onChange={(e) => updateFormData("previousPetName", e.target.value)}
                placeholder="Nom de l'animal précédent"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="prevVetLikes" className="text-sm font-medium text-slate-700 mb-2 block">
                Qu'avez-vous aimé chez votre vétérinaire précédent ?
              </Label>
              <Textarea
                id="prevVetLikes"
                value={formData.prevVetLikes}
                onChange={(e) => updateFormData("prevVetLikes", e.target.value)}
                placeholder="Ce qui était bien..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="needsFromUs" className="text-sm font-medium text-slate-700 mb-2 block">
                Qu'attendez-vous de nous ?
              </Label>
              <Textarea
                id="needsFromUs"
                value={formData.needsFromUs}
                onChange={(e) => updateFormData("needsFromUs", e.target.value)}
                placeholder="Comment pouvons-nous mieux vous servir..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-200">
        <Label htmlFor="knownMedicalIssues" className="text-base font-medium text-slate-700 mb-2 block">
          Problèmes médicaux ou comportementaux connus (optionnel)
        </Label>
        <Textarea
          id="knownMedicalIssues"
          value={formData.knownMedicalIssues}
          onChange={(e) => updateFormData("knownMedicalIssues", e.target.value)}
          placeholder="Maladies, allergies, problèmes de comportement..."
          className="mt-1"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="dietFoodType" className="text-base font-medium text-slate-700 mb-2 block">
          Type de nourriture et habitudes alimentaires (optionnel)
        </Label>
        <Textarea
          id="dietFoodType"
          value={formData.dietFoodType}
          onChange={(e) => updateFormData("dietFoodType", e.target.value)}
          placeholder="Type de nourriture, fréquence d'alimentation..."
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="pt-4 border-t border-slate-200">
        <Label className="text-base font-medium text-slate-700 mb-4 block">
          Niveau d'anxiété lors des visites chez le vétérinaire *
        </Label>
        <p className="text-sm text-slate-600 mb-4">
          Sur une échelle de 1 à 10, à quel point votre animal est-il anxieux lors des visites chez le vétérinaire ?
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
            <span className="text-green-600 font-medium">1 - Calme</span>
            <span className="text-blue-600 font-bold text-lg">{formData.vetAnxietyLevel}</span>
            <span className="text-red-600 font-medium">10 - Très anxieux</span>
          </div>
        </div>

        {formData.vetAnxietyLevel >= 5 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <Label htmlFor="anxietyHelpSuggestions" className="text-sm font-medium text-amber-800 mb-2 block">
              💡 Suggestions pour réduire le stress (optionnel)
            </Label>
            <Textarea
              id="anxietyHelpSuggestions"
              value={formData.anxietyHelpSuggestions}
              onChange={(e) => updateFormData("anxietyHelpSuggestions", e.target.value)}
              placeholder="Qu'est-ce qui aide votre animal à se calmer ? Friandises, jouets, environnement calme..."
              className="mt-2 bg-white"
              rows={3}
            />
          </div>
        )}
      </div>
    </div>
  );
}