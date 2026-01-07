import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { AlertCircle } from 'lucide-react';

export default function MedicalHistoryStepEn({ formData, updateFormData }) {
  return (
    <div className="space-y-8">
      {/* First Visit */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-700 flex items-center gap-2">
          <span className="text-red-500">*</span>
          Is this your first time at a veterinarian?
        </Label>
        <RadioGroup 
          value={formData.firstVisit} 
          onValueChange={(value) => updateFormData('firstVisit', value)}
          className="space-y-2"
        >
          <div className="flex items-center justify-start space-x-2">
            <RadioGroupItem value="yes" id="first-visit-yes" />
            <Label htmlFor="first-visit-yes" className="cursor-pointer font-normal">Yes, this is the first time</Label>
          </div>
          <div className="flex items-center justify-start space-x-2">
            <RadioGroupItem value="no" id="first-visit-no" />
            <Label htmlFor="first-visit-no" className="cursor-pointer font-normal">No, transferring from another clinic</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Conditional questions based on answer */}
      {formData.firstVisit === 'yes' && (
        <div className="space-y-3 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100 shadow-sm">
          <Label className="text-base font-medium text-slate-800">
            How did you hear about the clinic?
          </Label>
          <Input
            value={formData.howHeardAboutUs}
            onChange={(e) => updateFormData('howHeardAboutUs', e.target.value)}
            placeholder="e.g., Friends recommended, advertisement, internet search..."
            className="bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400"
          />
        </div>
      )}

      {formData.firstVisit === 'no' && (
        <div className="space-y-6 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
          <div className="space-y-3">
            <Label className="text-base font-medium text-slate-800">
              Previous Clinic/Veterinarian Name
            </Label>
            <Input
              value={formData.previousClinicName}
              onChange={(e) => updateFormData('previousClinicName', e.target.value)}
              placeholder="Name of the clinic or veterinarian"
              className="bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-400"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium text-slate-800">
              What did you like about your previous veterinarian?
            </Label>
            <Textarea
              value={formData.prevVetLikes}
              onChange={(e) => updateFormData('prevVetLikes', e.target.value)}
              placeholder="What was good? This will help us understand what's important to you"
              className="bg-white h-24 border-slate-200 focus:border-indigo-400 focus:ring-indigo-400"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium text-slate-800">
              What's important to you in our clinic?
            </Label>
            <Textarea
              value={formData.needsFromUs}
              onChange={(e) => updateFormData('needsFromUs', e.target.value)}
              placeholder="We'd love to know what's especially important to you..."
              className="bg-white h-24 border-slate-200 focus:border-indigo-400 focus:ring-indigo-400"
            />
          </div>
        </div>
      )}

      {/* Known Medical Issues */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-800">
          Known Medical/Behavioral Issues
        </Label>
        <p className="text-sm text-slate-500">
          e.g., Allergies, chronic diseases, barking, special medical conditions
        </p>
        <Textarea
          value={formData.knownMedicalIssues}
          onChange={(e) => updateFormData('knownMedicalIssues', e.target.value)}
          placeholder="Please specify..."
          className="h-24 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
        />
      </div>

      {/* Food Type */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-800">
          Food Type
        </Label>
        <p className="text-sm text-slate-500">
          e.g., Dry/wet, brand, frequency, special portions
        </p>
        <Textarea
          value={formData.dietFoodType}
          onChange={(e) => updateFormData('dietFoodType', e.target.value)}
          placeholder="Describe the food type, brand, quantity, etc..."
          className="h-24 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
        />
      </div>

    
      {/* Anxiety Level at Vet */}
      <div className="space-y-4 bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <Label className="text-base font-medium text-slate-800">
            Anxiety Level at the Vet
          </Label>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Anxiety level (1 = very calm, 10 = very stressed)
        </p>
        
        <div className="bg-white p-5 rounded-lg border border-amber-100 shadow-sm">
          <Slider
            value={[formData.vetAnxietyLevel]}
            onValueChange={(value) => updateFormData('vetAnxietyLevel', value[0])}
            min={1}
            max={10}
            step={1}
            className="mb-4"
          />
          
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-emerald-600">Calm (1)</span>
            <span className="text-2xl font-bold text-amber-600">{formData.vetAnxietyLevel}</span>
            <span className="text-rose-600">High anxiety (10)</span>
          </div>
        </div>

        {formData.vetAnxietyLevel >= 6 && (
          <div className="space-y-3 bg-gradient-to-br from-yellow-50 to-amber-50 p-5 rounded-lg border border-yellow-200 shadow-sm mt-4">
            <Label className="text-base font-medium text-slate-800">
              Suggestions for Reducing Stress
            </Label>
            <p className="text-sm text-slate-600">
              What do you think could help your pet feel more comfortable during the visit?
            </p>
            <Textarea
              value={formData.anxietyHelpSuggestions}
              onChange={(e) => updateFormData('anxietyHelpSuggestions', e.target.value)}
              placeholder="e.g., Favorite treats, specific toy, music, extra time to adjust..."
              className="h-24 bg-white border-slate-200 focus:border-amber-400 focus:ring-amber-400"
            />
          </div>
        )}
      </div>
    </div>
  );
}