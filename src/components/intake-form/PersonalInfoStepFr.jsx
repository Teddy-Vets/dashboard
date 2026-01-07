import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Phone, Mail, Home, IdCard } from "lucide-react";

export default function PersonalInfoStepFr({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="ownerName" className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          Nom complet *
        </Label>
        <Input
          id="ownerName"
          value={formData.ownerName}
          onChange={(e) => updateFormData("ownerName", e.target.value)}
          placeholder="Entrez votre nom complet"
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="ownerIdNumber" className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
          <IdCard className="w-4 h-4 text-blue-500" />
          Numéro d'identité *
        </Label>
        <Input
          id="ownerIdNumber"
          value={formData.ownerIdNumber}
          onChange={(e) => updateFormData("ownerIdNumber", e.target.value)}
          placeholder="123456789"
          maxLength={9}
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="phone" className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
          <Phone className="w-4 h-4 text-blue-500" />
          Téléphone portable *
        </Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => updateFormData("phone", e.target.value)}
          placeholder="05X-XXXXXXX"
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="email" className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-500" />
          Email (optionnel)
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData("email", e.target.value)}
          placeholder="example@email.com"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="address" className="text-base font-medium text-slate-700 mb-2 flex items-center gap-2">
          <Home className="w-4 h-4 text-blue-500" />
          Adresse de résidence (optionnel)
        </Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => updateFormData("address", e.target.value)}
          placeholder="Rue, ville"
          className="mt-1"
        />
      </div>

      <div className="pt-4 border-t border-slate-200">
        <Label className="text-base font-medium text-slate-700 mb-4 block">
          Est-ce votre premier animal de compagnie ? *
        </Label>
        <RadioGroup
          value={formData.firstEverPet}
          onValueChange={(value) => updateFormData("firstEverPet", value)}
          className="space-y-3"
        >
          <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <RadioGroupItem value="yes" id="first-yes-fr" />
            <Label htmlFor="first-yes-fr" className="flex-1 cursor-pointer font-normal">
              Oui, c'est notre premier animal de compagnie
            </Label>
          </div>
          <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <RadioGroupItem value="no" id="first-no-fr" />
            <Label htmlFor="first-no-fr" className="flex-1 cursor-pointer font-normal">
              Non, nous avons déjà eu ou avons d'autres animaux
            </Label>
          </div>
        </RadioGroup>

        {formData.firstEverPet === "yes" && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Label htmlFor="firstPetStory" className="text-sm font-medium text-blue-800 mb-2 block">
              📖 Nous aimerions beaucoup entendre l'histoire - comment votre premier animal est arrivé dans votre famille ?
            </Label>
            <Textarea
              id="firstPetStory"
              value={formData.firstPetStory}
              onChange={(e) => updateFormData("firstPetStory", e.target.value)}
              placeholder="Partagez l'histoire..."
              className="mt-2 bg-white"
              rows={4}
            />
          </div>
        )}

        {formData.firstEverPet === "no" && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Label htmlFor="notFirstPetInfo" className="text-sm font-medium text-blue-800 mb-2 block">
              Parlez-nous de vos animaux et qui s'en occupe principalement
            </Label>
            <Textarea
              id="notFirstPetInfo"
              value={formData.notFirstPetInfo}
              onChange={(e) => updateFormData("notFirstPetInfo", e.target.value)}
              placeholder="Par exemple : Nous avons 2 chiens, je m'en occupe principalement..."
              className="mt-2 bg-white"
              rows={4}
            />
          </div>
        )}
      </div>
    </div>
  );
}