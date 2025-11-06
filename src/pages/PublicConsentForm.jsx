import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { validateLink } from "@/functions/validateLink";
import PublicSurgeryConsent from "@/components/consent-form/PublicSurgeryConsent";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";

export default function PublicConsentFormPage() {
  const [searchParams] = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);
  const [linkData, setLinkData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const validateToken = async () => {
      const token = searchParams.get("t");
      
      if (!token) {
        setError("הקישור לא תקין - חסר טוקן אימות. אנא בקשו קישור חדש מהמרפאה.");
        setIsValidating(false);
        return;
      }

      try {
        const response = await validateLink({ t: token });
        
        if (response.data?.valid) {
          setLinkData(response.data);
        } else {
          setError(response.data?.error || "הקישור אינו תקף או פג תוקפו. אנא פנו למרפאה לקבלת קישור חדש.");
        }
      } catch (err) {
        console.error("Link validation error:", err);
        setError("שגיאה באימות הקישור. אנא נסו שנית או פנו למרפאה.");
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [searchParams]);

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-slate-600">מאמת את הקישור...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4">
        <div className="max-w-2xl mx-auto mt-20">
          <ErrorMessage 
            error={{ message: error }}
            title="שגיאה בטעינת הטופס"
          />
        </div>
      </div>
    );
  }

  if (!linkData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4">
        <div className="max-w-2xl mx-auto mt-20">
          <ErrorMessage 
            error={{ message: "לא ניתן היה לטעון את הטופס" }}
            title="שגיאה"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      <PublicSurgeryConsent 
        linkData={linkData}
        token={searchParams.get("t")}
      />
    </div>
  );
}