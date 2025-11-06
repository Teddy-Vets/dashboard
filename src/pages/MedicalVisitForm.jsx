import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Stethoscope, 
  Activity, 
  Eye, 
  Droplet, 
  Bone, 
  Heart, 
  Wind,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

const medicalReasonOptions = [
  { 
    id: "emergency", 
    label: "חירום - דורש טיפול מיידי!", 
    icon: AlertCircle,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-400",
    textColor: "text-red-900",
    isEmergency: true
  },
  { 
    id: "checkup", 
    label: "בדיקה שגרתית", 
    icon: Stethoscope,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800"
  },
  { 
    id: "digestive", 
    label: "בעיות עיכול", 
    icon: Activity,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-800"
  },
  { 
    id: "skin", 
    label: "בעיות עור ופרווה", 
    icon: Droplet,
    color: "from-green-500 to-teal-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-800"
  },
  { 
    id: "teeth", 
    label: "בעיות שיניים", 
    icon: Bone,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-800"
  },
  { 
    id: "injury", 
    label: "פציעה או כאב", 
    icon: Heart,
    color: "from-red-500 to-pink-500",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    textColor: "text-pink-800"
  },
  { 
    id: "breathing", 
    label: "בעיות נשימה", 
    icon: Wind,
    color: "from-cyan-500 to-blue-500",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    textColor: "text-cyan-800"
  },
  { 
    id: "other", 
    label: "אחר", 
    icon: HelpCircle,
    color: "from-gray-500 to-slate-500",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    textColor: "text-gray-800"
  },
];

export default function MedicalVisitForm({ formData, updateFormData, onNext, onBack }) {
  const [selectedReasons, setSelectedReasons] = useState(
    formData.medical_reason ? formData.medical_reason.split(', ') : []
  );

  const toggleReason = (reasonId) => {
    const option = medicalReasonOptions.find(opt => opt.id === reasonId);
    if (!option) return;

    setSelectedReasons(prev => {
      const newReasons = prev.includes(option.label)
        ? prev.filter(r => r !== option.label)
        : [...prev, option.label];
      
      updateFormData('medical_reason', newReasons.join(', '));
      return newReasons;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedReasons.length === 0) {
      alert("אנא בחרו לפחות סיבה אחת לביקור");
      return;
    }
    onNext();
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">ספרו לנו, איך נוכל לעזור?</h2>
        <p className="text-slate-600">אל דאגה, אפשר לבחור כמה אפשרויות.</p>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold text-slate-700">בחרו מהרשימה:</Label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {medicalReasonOptions.map((option, index) => {
            const isSelected = selectedReasons.includes(option.label);
            const Icon = option.icon;
            
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    option.isEmergency 
                      ? `${isSelected ? 'ring-4 ring-red-500 shadow-2xl scale-105 bg-red-500' : 'bg-red-500 hover:ring-4 hover:ring-red-400'}` 
                      : `${isSelected ? 'ring-4 ring-blue-400 shadow-xl scale-105' : 'hover:ring-2 hover:ring-blue-200'}`
                  }`}
                  onClick={() => toggleReason(option.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${option.color} flex items-center justify-center ${option.isEmergency && !isSelected ? 'bg-white' : ''}`}>
                      <Icon className={`w-8 h-8 ${option.isEmergency && !isSelected ? 'text-red-500' : 'text-white'}`} />
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${option.isEmergency && !isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {option.label}
                    </h3>
                    <div
                      className={`w-6 h-6 mx-auto rounded-md border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? option.isEmergency 
                            ? 'bg-white border-white' 
                            : 'bg-blue-600 border-blue-600'
                          : option.isEmergency
                            ? 'border-white bg-transparent'
                            : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className={`w-4 h-4 ${option.isEmergency ? 'text-red-500' : 'text-white'}`}
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additional-details" className="text-base font-semibold text-slate-700">
          פרטים נוספים (אופציונלי)
        </Label>
        <Textarea
          id="additional-details"
          value={formData.notes || ''}
          onChange={(e) => updateFormData('notes', e.target.value)}
          placeholder="ספרו לנו עוד על המצב... זה יעזור לנו להיות מוכנים טוב יותר"
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="flex gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          חזרה
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          disabled={selectedReasons.length === 0}
        >
          המשך לבחירת תאריך
        </Button>
      </div>
    </motion.form>
  );
}