import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import StepLayout from "./StepLayout";

export default function DateTimeSelectionScreen({ formData, setFormData, onNext, onBack }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <StepLayout onBack={onBack}>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">מתי נוח לכם?</h2>
          <p className="text-gray-600">בחרו תאריך ושעה מועדפים</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="preferred_date">תאריך מועדף *</Label>
            <Input
              id="preferred_date"
              type="date"
              value={formData.preferred_date || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, preferred_date: e.target.value }))}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <Label htmlFor="preferred_time">שעה מועדפת *</Label>
            <Input
              id="preferred_time"
              type="time"
              value={formData.preferred_time || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, preferred_time: e.target.value }))}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-4 text-lg">
          המשך לסיכום
        </Button>
      </motion.form>
    </StepLayout>
  );
}