import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import StepLayout from "./StepLayout";

export default function VaccinationDetailsScreen({ formData, setFormData, onNext, onBack }) {
  const [selected, setSelected] = useState(formData.vaccination_types || []);

  const vaccinations = [
    'חיסון כלבת',
    'חיסון משולב (5 in 1)',
    'חיסון נגד טפילים',
    'חיסון נגד שעלת'
  ];

  const handleToggle = (vax) => {
    setSelected((prev) =>
      prev.includes(vax) ? prev.filter((v) => v !== vax) : [...prev, vax]
    );
  };

  const handleNext = () => {
    setFormData((prev) => ({ ...prev, vaccination_types: selected }));
    onNext();
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">איזה חיסונים?</h2>
          <p className="text-gray-600">בחרו את החיסונים הנדרשים</p>
        </div>

        <div className="space-y-4">
          {vaccinations.map((vax) => (
            <div key={vax} className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg hover:bg-gray-50">
              <Checkbox
                id={vax}
                checked={selected.includes(vax)}
                onCheckedChange={() => handleToggle(vax)}
              />
              <Label htmlFor={vax} className="flex-1 cursor-pointer">{vax}</Label>
            </div>
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={selected.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 py-4 text-lg"
        >
          המשך לבחירת תאריך
        </Button>
      </motion.div>
    </StepLayout>
  );
}