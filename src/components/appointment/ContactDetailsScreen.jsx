import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import StepLayout from "./StepLayout";

export default function ContactDetailsScreen({ formData, setFormData, onNext, onBack }) {
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">בואו נכיר!</h2>
          <p className="text-gray-600">פרטי קשר קצרים ונמשיך</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="ownerName">שם מלא *</Label>
            <Input
              id="ownerName"
              value={formData.ownerName || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, ownerName: e.target.value }))}
              required
              placeholder="איך קוראים לך?"
            />
          </div>

          <div>
            <Label htmlFor="ownerPhone">טלפון *</Label>
            <Input
              id="ownerPhone"
              type="tel"
              value={formData.ownerPhone || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, ownerPhone: e.target.value }))}
              required
              placeholder="050-1234567"
            />
          </div>

          <div>
            <Label htmlFor="ownerEmail">אימייל (אופציונלי)</Label>
            <Input
              id="ownerEmail"
              type="email"
              value={formData.ownerEmail || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, ownerEmail: e.target.value }))}
              placeholder="email@example.com"
            />
          </div>

          <div>
            <Label htmlFor="petName">שם חיית המחמד *</Label>
            <Input
              id="petName"
              value={formData.petName || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, petName: e.target.value }))}
              required
              placeholder="איך קוראים לחבר הפרוותי שלך?"
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-4 text-lg">
          המשך
        </Button>
      </motion.form>
    </StepLayout>
  );
}