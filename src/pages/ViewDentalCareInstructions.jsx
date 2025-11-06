import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Sparkles,
  Calendar,
  User,
  PawPrint,
  FileText,
  Download,
  Loader2,
  AlertTriangle,
  Stethoscope,
  Pill,
  Heart,
  Clock
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/components/utils/urlHelpers";
import { formatDateInIsrael } from "@/components/utils/dateUtils";
import { generateDentalCareInstructionsPDF } from "@/functions/generateDentalCareInstructionsPDF";
import { validateLink } from "@/functions/validateLink";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import PageHeader from "@/components/common/PageHeader";

const InstructionSection = ({ icon: Icon, title, children, className = "" }) => (
  <div className={`flex items-start gap-4 ${className}`}>
    <Icon className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <div className="prose prose-slate max-w-none text-slate-600">{children}</div>
    </div>
  </div>
);

export default function ViewDentalCareInstructionsPage() {
  const [instruction, setInstruction] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const isPublicView = urlParams.has('t');

  useEffect(() => {
    loadInstruction();
  }, [location.search]);

  const loadInstruction = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data, clinicData;
      if (isPublicView) {
        const token = urlParams.get('t');
        const response = await validateLink({ t: token });
        if (!response.data?.valid) throw new Error(response.data?.error || 'הקישור אינו תקף או פג תוקפו');
        data = response.data.form;
        clinicData = response.data.clinic;
      } else {
        const id = urlParams.get('id');
        if (!id) throw new Error("מזהה הנחיה חסר");
        const { DentalCareInstructions } = await import('@/entities/all');
        const results = await DentalCareInstructions.filter({id: id});
        if (!results || results.length === 0) throw new Error("ההנחיה לא נמצאה");
        data = results[0];
        
        if (data.clinic_id) {
          const { Clinic } = await import('@/entities/Clinic');
          const clinics = await Clinic.filter({ id: data.clinic_id });
          if (clinics && clinics.length > 0) clinicData = clinics[0];
        }
      }
      setInstruction(data);
      setClinic(clinicData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!instruction) return;
    setIsDownloading(true);
    try {
      const response = await generateDentalCareInstructionsPDF({ instructionId: instruction.id });
      if (response.data) {
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dental-instructions-${instruction.pet_name}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        throw new Error("Failed to generate PDF.");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };
  
  if (isLoading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="xl" /></div>;
  if (error) return <div className="p-8"><ErrorMessage error={{ message: error }} onRetry={loadInstruction} /></div>;
  if (!instruction) return <div className="p-8 text-center">לא נמצאו נתונים.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="הנחיות טיפול שיניים"
          description={`הנחיות עבור ${instruction.pet_name}`}
          actions={
            <Button onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Download className="ml-2 h-4 w-4" />}
              הורד כ-PDF
            </Button>
          }
        />

        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">פרטי הטיפול</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-500" /><span>{instruction.owner_name}</span></div>
            <div className="flex items-center gap-2"><PawPrint className="w-4 h-4 text-slate-500" /><span>{instruction.pet_name}</span></div>
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-500" /><span>{formatDateInIsrael(instruction.procedure_date)}</span></div>
            <div className="flex items-center gap-2"><Stethoscope className="w-4 h-4 text-slate-500" /><span>{instruction.procedure_details}</span></div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardContent className="p-6 md:p-8 space-y-8">
            {instruction.critical_instructions && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <AlertTitle className="font-bold text-red-800">הנחיות קריטיות</AlertTitle>
                <AlertDescription className="text-red-700">{instruction.critical_instructions}</AlertDescription>
              </Alert>
            )}

            <InstructionSection icon={Pill} title="טיפול תרופתי">
              <p>{instruction.medication_instructions || "לא צוין טיפול תרופתי."}</p>
            </InstructionSection>

            <InstructionSection icon={Heart} title="האכלה ושתיה">
              <p>{instruction.feeding_instructions || "ניתן לחזור להאכלה רגילה, אלא אם צוין אחרת."}</p>
            </InstructionSection>

            <InstructionSection icon={Clock} title="המשך מעקב">
              <p>{instruction.monitoring_instructions || "יש לעקוב אחר מצב חיית המחמד. במקרה של שינוי, יש ליצור קשר."}</p>
            </InstructionSection>

            {instruction.next_appointment_details && (
              <InstructionSection icon={Calendar} title="ביקורת עתידית">
                <p>{instruction.next_appointment_details}</p>
              </InstructionSection>
            )}

            {instruction.general_notes && (
              <InstructionSection icon={FileText} title="הערות כלליות">
                <p>{instruction.general_notes}</p>
              </InstructionSection>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}