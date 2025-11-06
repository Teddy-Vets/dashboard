import React, { useState, useEffect } from 'react';
import { validateLink } from '@/functions/validateLink';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import ViewSubmittedIntakeForm from '@/components/intake-form/ViewSubmittedIntakeForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint } from 'lucide-react';

export default function PublicViewIntakeForm() {
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadForm = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('t');

        if (!token) {
          throw new Error('קישור לא תקין או חסר מזהה ייחודי.');
        }
        
        const response = await validateLink({ t: token });

        if (!response.data?.valid || !response.data?.form) {
          throw new Error(response.data?.error || 'הקישור אינו תקף או שפג תוקפו.');
        }

        if (response.data.linkData.form_type !== 'intake') {
          throw new Error('סוג הטופס בקישור אינו תואם.');
        }

        setFormData(response.data.form);
      } catch (err) {
        console.error("Failed to load public intake form:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadForm();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center p-8">
          <LoadingSpinner size="xl" className="mx-auto mb-4" />
          <p className="text-slate-600">טוען את פרטי הטופס...</p>
        </div>
      );
    }

    if (error) {
      return <ErrorMessage error={error} showRetry={false} className="m-8" />;
    }

    if (formData) {
      return <ViewSubmittedIntakeForm formData={formData} />;
    }

    return (
      <div className="text-center p-8">
        <p className="text-slate-500">לא נמצאו נתונים להצגה.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4 md:p-8" dir="rtl">
      <Card className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm border-blue-200 shadow-xl">
        <CardHeader className="text-center border-b bg-gradient-to-r from-blue-50 to-teal-50">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
              <PawPrint className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            סיכום טופס היכרות
          </CardTitle>
          {formData && <p className="text-slate-600 mt-2">סיכום הפרטים שנשלחו עבור {formData.pet_name}</p>}
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}