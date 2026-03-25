import React, { useState, useEffect } from 'react';
import { IntakeForm, Client, Pet, User } from '@/entities/all';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import ViewSubmittedIntakeForm from '@/components/intake-form/ViewSubmittedIntakeForm';
import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus, PawPrint, Loader2, Printer } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/components/utils/urlHelpers";
import { getEntityById, createEntity, updateEntity, ApiError } from '@/components/utils/apiHelpers';

export default function ViewIntakeFormPage() {
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadForm();
  }, []);

  const loadForm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const urlParams = new URLSearchParams(location.search);
      const formId = urlParams.get('id');

      if (!formId) {
        throw new Error('לא צוין מזהה טופס.');
      }
      
      const form = await getEntityById(IntakeForm, formId, 'IntakeForm');
      setFormData(form);

      if (form.status === 'submitted') {
        await updateEntity(IntakeForm, form.id, { status: 'reviewed' }, 'IntakeForm');
        setFormData(prev => ({ ...prev, status: 'reviewed' }));
      }

    } catch (err) {
      console.error("Failed to load intake form:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClientAndPet = async () => {
    setIsProcessing(true);
    setProcessingError(null);
    try {
      if (!formData) throw new Error("נתוני הטופס לא זמינים.");

      // שלב 1: יצירת לקוח חדש
      const clientData = {
        clinic_id: formData.clinic_id,
        owner_name: formData.owner_name,
        phone: formData.owner_phone,
        email: formData.owner_email,
        address: formData.address,
        status: 'active'
      };
      const newClient = await createEntity(Client, clientData, 'Client');

      // שלב 2: יצירת חיית מחמד חדשה
      const petData = {
        clinic_id: formData.clinic_id,
        client_id: newClient.id,
        pet_name: formData.pet_name,
        pet_type: formData.pet_type,
        breed: formData.pet_breed,
        birth_date: null,
        age_estimate: formData.pet_age,
        gender: formData.pet_gender,
        neutered: formData.pet_neutered,
        microchip: formData.pet_microchip,
        picture_url: formData.pet_picture_url,
        status: 'active'
      };
      const newPet = await createEntity(Pet, petData, 'Pet');

      // שלב 3: עדכון טופס ההיכרות עם מזהים ושינוי סטטוס
      await updateEntity(IntakeForm, formData.id, {
        client_id: newClient.id,
        pet_id: newPet.id,
        status: 'completed'
      }, 'IntakeForm');

      alert("הלקוח וחיית המחמד נוצרו בהצלחה! הטופס סומן כהושלם.");
      navigate(createPageUrl('IntakeFormsList'));

    } catch (err) {
      console.error("Error processing form:", err);
      const errorMessage = err instanceof ApiError ? err.message : "אירעה שגיאה בעיבוד הטופס.";
      setProcessingError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderContent = () => {
    if (isLoading) return <div className="text-center p-8"><LoadingSpinner size="xl" /></div>;
    if (error) return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;
    if (formData) return <ViewSubmittedIntakeForm formData={formData} />;
    return <p className="text-center p-8">לא נמצאו נתונים.</p>;
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen" dir="rtl">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          nav, header, aside, [class*="sidebar"], [class*="lg:flex lg:w-64"] { display: none !important; }
          .lg\\:mr-64 { margin-right: 0 !important; }
          body { background: white !important; }
        }
      `}</style>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 no-print">
          <Button variant="outline" onClick={() => navigate(createPageUrl('IntakeFormsList'))}>
            <ArrowRight className="w-4 h-4 ml-2" />
            חזור לרשימה
          </Button>
          <h1 className="text-2xl font-bold">צפייה בטופס היכרות</h1>
          <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-1">
            <Printer className="w-4 h-4" />
            הדפס / שמור כ-PDF בתיק לקוח
          </Button>
        </div>
        
        {formData && formData.status === 'reviewed' && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md mb-6 no-print" role="alert">
            <p className="font-bold">טופס זה ממתין ליצירת לקוח וחיית מחמד.</p>
            <p>לחץ על הכפתור כדי ליצור רשומות חדשות במערכת על סמך הפרטים בטופס.</p>
            <div className="mt-4">
              <Button onClick={handleCreateClientAndPet} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    מעבד...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 ml-2" />
                    צור לקוח וחיית מחמד
                  </>
                )}
              </Button>
              {processingError && <p className="text-red-600 text-sm mt-2">{processingError}</p>}
            </div>
          </div>
        )}
        
        {renderContent()}
      </div>
    </div>
  );
}