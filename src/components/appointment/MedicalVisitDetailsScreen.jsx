import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Stethoscope, Activity, Droplets, Bone, Heart, Wind, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import StepLayout from "./StepLayout";

export default function MedicalVisitDetailsScreen({ formData, setFormData, onNext, onBack }) {
  const [selectedReasons, setSelectedReasons] = useState(
    formData.medical_reason ? formData.medical_reason.split(', ').filter(Boolean) : []
  );
  const [customReason, setCustomReason] = useState('');

  const commonReasons = [
    { id: 'emergency', label: 'חירום - דורש טיפול מיידי!', icon: AlertCircle, isEmergency: true },
    { id: 'checkup', label: 'בדיקה שגרתית', icon: Stethoscope },
    { id: 'digestive', label: 'בעיות עיכול', icon: Activity },
    { id: 'skin', label: 'בעיות עור ופרווה', icon: Droplets },
    { id: 'teeth', label: 'בעיות שיניים', icon: Bone },
    { id: 'injury', label: 'פציעה או כאב', icon: Heart },
    { id: 'breathing', label: 'בעיות נשימה', icon: Wind },
    { id: 'other', label: 'אחר', icon: HelpCircle }
  ];

  const handleReasonToggle = (reasonLabel) => {
    setSelectedReasons((prev) =>
      prev.includes(reasonLabel) ? prev.filter((r) => r !== reasonLabel) : [...prev, reasonLabel]
    );
  };

  const handleNextClick = () => {
    const allReasons = [...selectedReasons];
    if (customReason.trim() && !allReasons.includes(customReason.trim())) {
      allReasons.push(customReason.trim());
    }

    if (allReasons.length > 0) {
      setFormData((prev) => ({ ...prev, medical_reason: allReasons.join(', ') }));
      onNext();
    }
  };

  return (
    <StepLayout onBack={onBack}>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">ספרו לנו, איך נוכל לעזור?</h2>
          <p className="text-gray-600">אל דאגה, אפשר לבחור כמה אפשרויות</p>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium text-gray-700 mb-2 block">בחרו מהרשימה:</Label>

          <div className="grid grid-cols-2 gap-3">
            {commonReasons.map((reason) => {
              const isSelected = selectedReasons.includes(reason.label);
              const Icon = reason.icon;

              return (
                <Card
                  key={reason.id}
                  onClick={() => handleReasonToggle(reason.label)}
                  className={`cursor-pointer border-2 transition-all h-28 ${
                    reason.isEmergency
                      ? isSelected
                        ? 'border-red-500 bg-red-500 shadow-lg'
                        : 'border-red-400 bg-red-500 hover:bg-red-600'
                      : isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <CardContent className="p-3 text-center flex flex-col items-center justify-center h-full">
                    <Icon className={`w-6 h-6 mb-2 ${
                      reason.isEmergency ? 'text-white' : isSelected ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      reason.isEmergency ? 'text-white' : isSelected ? 'text-blue-800' : 'text-gray-700'
                    }`}>
                      {reason.label}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-6">
            <Label className="text-base font-medium text-gray-700 mb-2 block">או כתבו בעצמכם:</Label>
            <Textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="תארו בפירוט נוסף..."
              rows="4"
            />
          </div>
        </div>

        <Button
          onClick={handleNextClick}
          disabled={selectedReasons.length === 0 && !customReason.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 py-4 text-lg"
        >
          המשך לבחירת תאריך
        </Button>
      </motion.div>
    </StepLayout>
  );
}