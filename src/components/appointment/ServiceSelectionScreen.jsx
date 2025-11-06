import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import StepLayout from "./StepLayout";

export default function ServiceSelectionScreen({ formData, setFormData, onNext, onBack }) {
  const handleSelect = (serviceType) => {
    setFormData((prev) => ({ ...prev, request_type: serviceType }));
    setTimeout(() => onNext(serviceType), 300);
  };

  const services = [
    { id: 'vaccination', label: 'חיסונים', icon: ShieldCheck, color: 'bg-green-50 border-green-200' },
    { id: 'medical', label: 'בדיקה רפואית', icon: Stethoscope, color: 'bg-blue-50 border-blue-200' }
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">למה הגעתם?</h2>
          <p className="text-gray-600">בחרו את סוג השירות</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card
                key={service.id}
                onClick={() => handleSelect(service.id)}
                className={`cursor-pointer hover:shadow-lg transition-all ${service.color}`}
              >
                <CardContent className="p-6 text-center">
                  <Icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-xl font-semibold">{service.label}</h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>
    </StepLayout>
  );
}