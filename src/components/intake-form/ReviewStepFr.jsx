import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ReviewStepFr({ formData }) {
  const renderField = (label, value) => {
    if (!value) return null;
    
    return (
      <div className="flex justify-between py-3 border-b border-slate-100 last:border-0">
        <span className="font-medium text-slate-600">{label}:</span>
        <span className="text-slate-800 text-right max-w-md">{value}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Résumé du formulaire</h3>
        <p className="text-slate-600">Veuillez vérifier que toutes les informations sont correctes avant de soumettre</p>
      </div>

      <Card className="border-2 border-blue-100">
        <CardContent className="p-6">
          <h4 className="font-bold text-lg text-blue-800 mb-4">👤 Informations personnelles</h4>
          {renderField("Nom complet", formData.ownerName)}
          {renderField("Numéro d'identité", formData.ownerIdNumber)}
          {renderField("Téléphone", formData.phone)}
          {renderField("Email", formData.email)}
          {renderField("Adresse", formData.address)}
          {renderField("Premier animal", formData.firstEverPet === "yes" ? "Oui" : formData.firstEverPet === "no" ? "Non" : "")}
          {renderField("Histoire du premier animal", formData.firstPetStory)}
          {renderField("Informations sur les autres animaux", formData.notFirstPetInfo)}
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-100">
        <CardContent className="p-6">
          <h4 className="font-bold text-lg text-blue-800 mb-4">🐾 Informations sur l'animal</h4>
          {renderField("Nom de l'animal", formData.petName)}
          {renderField("Type d'animal", formData.petType)}
          {renderField("Race", formData.petBreed)}
          {renderField("Âge", formData.petAge)}
          {renderField("Sexe", formData.petGender)}
          {renderField("Stérilisé/castré", formData.petNeutered)}
          {renderField("Numéro de puce", formData.petMicrochip)}
          {formData.petPictureUrl && <div className="py-3"><Label>Photo de l'animal: </Label><span className="text-green-600">✓ Téléchargée</span></div>}
          {formData.vaccineBookUrl && <div className="py-3"><Label>Carnet de vaccination: </Label><span className="text-green-600">✓ Téléchargé</span></div>}
          {formData.previousTreatmentsFileUrl && <div className="py-3"><Label>Traitements antérieurs: </Label><span className="text-green-600">✓ Téléchargés</span></div>}
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-100">
        <CardContent className="p-6">
          <h4 className="font-bold text-lg text-blue-800 mb-4">🏥 Histoire médicale</h4>
          {renderField("Première visite", formData.firstVisit === "yes" ? "Oui" : formData.firstVisit === "no" ? "Non" : "")}
          {renderField("Comment nous avez-vous connus", formData.howHeardAboutUs)}
          {renderField("Clinique précédente", formData.previousClinicName)}
          {renderField("Animal précédent chez nous", formData.previousPetName)}
          {renderField("Ce qui était bien chez le précédent vétérinaire", formData.prevVetLikes)}
          {renderField("Attentes de notre part", formData.needsFromUs)}
          {renderField("Problèmes médicaux connus", formData.knownMedicalIssues)}
          {renderField("Type de nourriture", formData.dietFoodType)}
          {renderField("Problèmes comportementaux", formData.behavioralIssues)}
          {renderField("Niveau d'anxiété chez le vétérinaire", `${formData.vetAnxietyLevel}/10`)}
          {renderField("Suggestions pour réduire l'anxiété", formData.anxietyHelpSuggestions)}
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-100">
        <CardContent className="p-6">
          <h4 className="font-bold text-lg text-blue-800 mb-4">📋 Informations sur la visite</h4>
          {renderField("Raison principale de la visite", formData.visitReasonMain)}
          {renderField("Détails supplémentaires", formData.visitReasonDetails)}
          {renderField("Autres sujets", formData.otherTopics)}
        </CardContent>
      </Card>

      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
        <p className="text-green-800 font-medium text-center">
          ✓ En soumettant ce formulaire, vous acceptez que nous sauvegardions et traitions ces informations pour vous fournir le meilleur service vétérinaire.
        </p>
      </div>
    </div>
  );
}