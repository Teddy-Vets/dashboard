import React, { useState, useEffect } from "react";
import PublicIntakeFormFlowEn from "../components/intake-form/PublicIntakeFormFlowEn";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import { validateLink } from "@/functions/validateLink";

export default function PublicFormEnPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [linkData, setLinkData] = useState(null);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('t');

    if (!token) {
      setError('Invalid link - missing identifier');
      setIsLoading(false);
      return;
    }

    validateLinkAndLoadForm(token);
  }, []);

  const validateLinkAndLoadForm = async (token) => {
    try {
      const response = await validateLink({ t: token });
      
      if (!response.data || !response.data.valid) {
        throw new Error(response.data?.error || 'The link is invalid or has expired');
      }

      const { form, linkData: link } = response.data;
      
      setLinkData(link);
      setFormData(form);
      setIsLoading(false);
    } catch (err) {
      console.error('Error validating link:', err);
      setError(err.message || 'Error loading form');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-slate-600 text-lg">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage 
            error={error}
            title="Error Loading Form"
          />
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Please contact the clinic for a new link
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PublicIntakeFormFlowEn 
      token={linkData?.token}
      formId={linkData?.form_id}
      initialData={formData || {}}
    />
  );
}