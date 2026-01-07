import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User, PawPrint, Heart, Info } from 'lucide-react';

const ReviewSection = ({ title, icon: Icon, children }) => (
  <Card className="bg-white/70">
    <CardHeader className="pb-4 border-b border-slate-200">
      <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-500" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-4 text-sm text-slate-700 space-y-2">
      {children}
    </CardContent>
  </Card>
);

const ReviewItem = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between">
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
    </div>
  );
};

export default function ReviewStepEn({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Summary and Confirmation</h3>
        <p className="text-slate-600">Please verify that the information you entered is correct before submitting</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReviewSection title="Personal Information" icon={User}>
          <ReviewItem label="Full Name" value={formData.ownerName} />
          <ReviewItem label="Phone" value={formData.phone} />
          <ReviewItem label="Email" value={formData.email} />
          <ReviewItem label="Address" value={formData.address} />
        </ReviewSection>

        <ReviewSection title="Pet Information" icon={PawPrint}>
          <ReviewItem label="Pet Name" value={formData.petName} />
          <ReviewItem label="Type" value={formData.petType} />
          <ReviewItem label="Breed" value={formData.petBreed} />
          <ReviewItem label="Age" value={formData.petAge} />
          <ReviewItem label="Gender" value={formData.petGender} />
          <ReviewItem label="Neutered/Spayed" value={formData.petNeutered} />
        </ReviewSection>
        
        <ReviewSection title="Medical History" icon={Heart}>
          <ReviewItem label="First Visit" value={formData.firstVisit === 'yes' ? 'Yes' : 'No'} />
          <ReviewItem label="Known Issues" value={formData.knownMedicalIssues} />
          <ReviewItem label="Diet" value={formData.dietFoodType} />
          <ReviewItem label="Behavioral Issues" value={formData.behavioralIssues} />
          <ReviewItem label="Anxiety Level" value={formData.vetAnxietyLevel} />
        </ReviewSection>

        <ReviewSection title="Visit Information" icon={Info}>
          <ReviewItem label="Reason for Visit" value={formData.visitReasonMain} />
          <ReviewItem label="Details" value={formData.visitReasonDetails} />
          <ReviewItem label="Additional Topics" value={formData.otherTopics} />
        </ReviewSection>
      </div>

      <div className="pt-6 border-t border-slate-200">
        <div className="flex items-center space-x-2 bg-blue-50 p-4 rounded-lg">
          <input
            type="checkbox"
            id="terms"
            checked={formData.client_consent || false}
            onChange={(e) => updateFormData('client_consent', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded ml-2"
          />
          <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            I confirm that the information I provided is correct and agree to the clinic's terms of service.
          </Label>
        </div>
      </div>
    </div>
  );
}