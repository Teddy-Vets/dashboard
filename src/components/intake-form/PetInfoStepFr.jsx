import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dog, Cat, Upload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PetInfoStepFr({ formData, updateFormData, onFileUpload, uploadingFiles }) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="petName" className="text-base font-medium text-slate-700 mb-2 block">
          Nom de l'animal *
        </Label>
        <Input
          id="petName"
          value={formData.petName}
          onChange={(e) => updateFormData("petName", e.target.value)}
          placeholder="Comment s'appelle votre compagnon à fourrure ?"
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label className="text-base font-medium text-slate-700 mb-3 block">Type d'animal *</Label>
        <div className="grid grid-cols-2 gap-4">
          <Card
            onClick={() => updateFormData("petType", "כלב")}
            className={`cursor-pointer border-2 transition-all ${
              formData.petType === "כלב"
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-slate-200 hover:border-blue-300"
            }`}
          >
            <CardContent className="p-6 text-center">
              <Dog className={`w-12 h-12 mx-auto mb-2 ${formData.petType === "כלב" ? "text-blue-600" : "text-slate-400"}`} />
              <span className={`font-semibold ${formData.petType === "כלב" ? "text-blue-800" : "text-slate-700"}`}>
                Chien
              </span>
            </CardContent>
          </Card>

          <Card
            onClick={() => updateFormData("petType", "חתול")}
            className={`cursor-pointer border-2 transition-all ${
              formData.petType === "חתול"
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-slate-200 hover:border-blue-300"
            }`}
          >
            <CardContent className="p-6 text-center">
              <Cat className={`w-12 h-12 mx-auto mb-2 ${formData.petType === "חתול" ? "text-blue-600" : "text-slate-400"}`} />
              <span className={`font-semibold ${formData.petType === "חתול" ? "text-blue-800" : "text-slate-700"}`}>
                Chat
              </span>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="petBreed" className="text-base font-medium text-slate-700 mb-2 block">
            Race (optionnel)
          </Label>
          <Input
            id="petBreed"
            value={formData.petBreed}
            onChange={(e) => updateFormData("petBreed", e.target.value)}
            placeholder="Race de l'animal"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="petAge" className="text-base font-medium text-slate-700 mb-2 block">
            Âge (optionnel)
          </Label>
          <Input
            id="petAge"
            value={formData.petAge}
            onChange={(e) => updateFormData("petAge", e.target.value)}
            placeholder="par exemple : 3 ans"
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="petGender" className="text-base font-medium text-slate-700 mb-2 block">
            Sexe (optionnel)
          </Label>
          <Select
            value={formData.petGender}
            onValueChange={(value) => updateFormData("petGender", value)}
          >
            <SelectTrigger id="petGender" className="mt-1">
              <SelectValue placeholder="Sélectionner le sexe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="זכר">Mâle</SelectItem>
              <SelectItem value="נקבה">Femelle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="petNeutered" className="text-base font-medium text-slate-700 mb-2 block">
            Stérilisé/castré ? (optionnel)
          </Label>
          <Select
            value={formData.petNeutered}
            onValueChange={(value) => updateFormData("petNeutered", value)}
          >
            <SelectTrigger id="petNeutered" className="mt-1">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="כן">Oui</SelectItem>
              <SelectItem value="לא">Non</SelectItem>
              <SelectItem value="מתוכנן">Prévu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="petMicrochip" className="text-base font-medium text-slate-700 mb-2 block">
          Numéro de puce (optionnel)
        </Label>
        <Input
          id="petMicrochip"
          value={formData.petMicrochip}
          onChange={(e) => updateFormData("petMicrochip", e.target.value)}
          placeholder="Si disponible"
          className="mt-1"
        />
      </div>

      <div className="pt-4 border-t border-slate-200">
        <Label className="text-base font-medium text-slate-700 mb-3 block">
          📸 Photo de l'animal (optionnel)
        </Label>
        <p className="text-sm text-slate-600 mb-3">
          Une photo nous aide à mieux connaître votre compagnon
        </p>
        
        {!formData.petPictureUrl ? (
          <div className="relative">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => onFileUpload(e, "petPictureUrl")}
              disabled={uploadingFiles.petPictureUrl}
              className="cursor-pointer"
            />
            {uploadingFiles.petPictureUrl && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <img src={formData.petPictureUrl} alt="Animal" className="w-full h-48 object-cover rounded-lg border-2 border-blue-200" />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={() => updateFormData("petPictureUrl", "")}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-200">
        <Label className="text-base font-medium text-slate-700 mb-3 block">
          📋 Résumé des traitements antérieurs (optionnel)
        </Label>
        <p className="text-sm text-slate-600 mb-3">
          Si vous avez un résumé des traitements antérieurs ou des résultats de tests
        </p>
        
        {!formData.previousTreatmentsFileUrl ? (
          <div className="relative">
            <Input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              onChange={(e) => onFileUpload(e, "previousTreatmentsFileUrl")}
              disabled={uploadingFiles.previousTreatmentsFileUrl}
              className="cursor-pointer"
            />
            {uploadingFiles.previousTreatmentsFileUrl && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
            <span className="text-sm text-green-800">✓ Fichier téléchargé</span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => updateFormData("previousTreatmentsFileUrl", "")}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-200">
        <Label className="text-base font-medium text-slate-700 mb-3 block">
          💉 Carnet de vaccination (optionnel)
        </Label>
        <p className="text-sm text-slate-600 mb-3">
          Photo ou fichier du carnet de vaccination
        </p>
        
        {!formData.vaccineBookUrl ? (
          <div className="relative">
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => onFileUpload(e, "vaccineBookUrl")}
              disabled={uploadingFiles.vaccineBookUrl}
              className="cursor-pointer"
            />
            {uploadingFiles.vaccineBookUrl && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
            <span className="text-sm text-green-800">✓ Fichier téléchargé</span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => updateFormData("vaccineBookUrl", "")}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}