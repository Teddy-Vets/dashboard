import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function HeroSection({ onStart }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* רקע תמונה */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687b78971cad562073ed5929/1382b2e26_Prz_8.jpg')`
        }}
      />

      {/* שכבה כהה לטקסט קריא יותר */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/30" />

      {/* תוכן */}
      <div className="relative z-10 min-h-screen flex items-center justify-center text-center text-white px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          {/* לוגו */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687b78971cad562073ed5929/c6a0b9e79_logo_medical.png"
                alt="Teddy Vets"
                className="max-w-md w-full h-auto object-contain filter brightness-0 invert drop-shadow-2xl"
              />
            </div>
          </div>

          {/* הודעה עיקרית */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4 drop-shadow-lg">
              שומרים יחד על הבריאות<br />
              של החברים הפרוותיים שלנו
            </h2>
          </div>

          {/* כפתור התחלה */}
          <Button
            onClick={onStart}
            size="lg"
            className="bg-red-100 text-blue-600 px-12 py-6 text-xl font-semibold hover:bg-gray-50 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            לקבוע תור לשקט הנפשי שלכם
          </Button>
        </motion.div>
      </div>
    </div>
  );
}