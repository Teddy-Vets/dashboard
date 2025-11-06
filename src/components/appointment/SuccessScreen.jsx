import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";

export default function SuccessScreen({ formData }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">הבקשה נשלחה בהצלחה!</h1>
        <p className="text-gray-600 mb-8">
          תודה {formData.ownerName}! נחזור אליך בהקדם לאישור התור.
          <br />
          <br />
          פרטי הבקשה נשלחו ל-{formData.ownerPhone}
        </p>

        <Button
          onClick={() => window.location.href = createPageUrl('AppointmentBooking')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          חזרה לדף הבית
        </Button>
      </motion.div>
    </div>
  );
}