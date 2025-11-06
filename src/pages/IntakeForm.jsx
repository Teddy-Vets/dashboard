import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/components/utils/urlHelpers";
import IntakeFormFlow from "../components/intake-form/IntakeFormFlow";

export default function IntakeFormPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate(createPageUrl("IntakeFormsList"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-6">
      <div className="max-w-4xl mx-auto">
        <IntakeFormFlow onSuccess={handleSuccess} />
      </div>
    </div>
  );
}