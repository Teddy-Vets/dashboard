import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import StepLayout from "./StepLayout";

export default function ReviewScreen({ formData, onBack, onSubmit, isSubmitting }) {
  return (
    <StepLayout onBack={onBack}>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">בואו נוודא שהכל נכון</h2>
          <p className="text-gray-600">סקירה אחרונה לפני השליחה</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-500">שם</p>
              <p className="font-medium">{formData.ownerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">טלפון</p>
              <p className="font-medium">{formData.ownerPhone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">שם חיית המחמד</p>
              <p className="font-medium">{formData.petName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">סוג שירות</p>
              <p className="font-medium">{formData.request_type === 'vaccination' ? 'חיסונים' : 'בדיקה רפואית'}</p>
            </div>
            {formData.medical_reason && (
              <div>
                <p className="text-sm text-gray-500">סיבת הביקור</p>
                <p className="font-medium">{formData.medical_reason}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">תאריך ושעה</p>
              <p className="font-medium">{formData.preferred_date} בשעה {formData.preferred_time}</p>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full bg-green-600 hover:bg-green-700 py-4 text-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              שולח...
            </>
          ) : (
            'אישור ושליחה'
          )}
        </Button>
      </motion.div>
    </StepLayout>
  );
}