import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dog, Cat, Bird } from "lucide-react";
import { motion } from "framer-motion";
import StepLayout from "./StepLayout";

export default function CustomerTypeScreen({ formData, setFormData, onNext, onBack }) {
  const handleSelect = (type) => {
    setFormData((prev) => ({ ...prev, customerType: type }));
    setTimeout(() => onNext(), 300);
  };

  const customerTypes = [
    { id: 'new', label: 'לקוח/ה חדש/ה', icon: Dog },
    { id: 'existing', label: 'לקוח/ה קיים/ת', icon: Cat }
  ];

  return (
    <StepLayout onBack={onBack}>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">מי אתם?</h2>
          <p className="text-gray-600">זה יעזור לנו להכין את הדברים הנכונים</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {customerTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.id}
                onClick={() => handleSelect(type.id)}
                className="cursor-pointer hover:shadow-lg hover:border-blue-400 transition-all"
              >
                <CardContent className="p-6 text-center">
                  <Icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-xl font-semibold">{type.label}</h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>
    </StepLayout>
  );
}