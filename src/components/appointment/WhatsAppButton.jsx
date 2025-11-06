import React from "react";
import { MessageSquare } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/972548959176?text=היי%20מרפאת%20טדי%20וטס,%20אני%20צריך/ה%20עזרה%20עם%20קביעת%20התור"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform hover:scale-110"
      aria-label="Contact us on WhatsApp"
    >
      <MessageSquare className="w-7 h-7" />
    </a>
  );
}