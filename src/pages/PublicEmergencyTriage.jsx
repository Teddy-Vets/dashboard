import React from "react";
import EmergencyTriageFlow from "@/components/emergency/EmergencyTriageFlow";

export default function PublicEmergencyTriagePage() {
  const handleSuccess = () => {
    alert("הטופס נשלח בהצלחה! נציג מהמרפאה יצור עמכם קשר בהקדם.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-sky-50 to-white p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687b78971cad562073ed5929/d7815950c_Yourparagraphtext1.png"
            alt="טדי וטס"
            className="mx-auto mb-6 w-48 h-auto object-contain"
          />
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3 leading-tight">
            אתכם בכל מצב - מענה ראשוני למצב חירום של חיית המחמד
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            עונו על השאלות הבאות כדי שנוכל להעריך את מצב חיית המחמד שלכם
          </p>
        </div>

        <EmergencyTriageFlow onSuccess={handleSuccess} />
      </div>
    </div>
  );
}