import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { isProduction } from '@/components/dev/detectEnv';

/**
 * Renders a prominent banner indicating that the user is in a test environment.
 * The banner is not rendered in the production environment.
 */
export default function TestEnvBanner() {
  if (isProduction()) {
    return null;
  }

  return (
    <div 
      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold p-2 text-center sticky top-0 z-[100] w-full flex items-center justify-center gap-2 shadow-lg"
      role="alert"
    >
      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      <span>סביבת בדיקות (TEST) - המידע המוצג אינו אמיתי ושליחת התראות חיצוניות מנוטרלת.</span>
    </div>
  );
}