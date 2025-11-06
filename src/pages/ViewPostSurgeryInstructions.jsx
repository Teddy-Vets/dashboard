
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  PawPrint, Calendar, Pill, Heart, AlertTriangle, CheckCircle, Clock, Stethoscope, Phone, Mail, MapPin, Download, ArrowRight
} from 'lucide-react';
import { formatDateInIsrael } from '@/components/utils/dateUtils';
import { validateLink } from '@/functions/validateLink';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/components/utils/urlHelpers';
import { getEntityById } from '@/components/utils/apiHelpers';
import PageHeader from '@/components/common/PageHeader';

// Helper function to render a section
const InstructionSection = ({ icon: Icon, title, children }) => (
  <div>
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-blue-100 rounded-lg">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
    </div>
    <div className="pl-10 text-slate-600 space-y-2">{children}</div>
  </div>
);

// Helper function to render a detail item
const DetailItem = ({ label, value }) => (
  value && (
    <div className="flex justify-between items-center text-sm py-2 border-b">
      <span className="font-medium text-slate-500">{label}:</span>
      <span className="font-semibold text-slate-700">{value}</span>
    </div>
  )
);

export default function ViewPostSurgeryInstructionsPage() {
  const [instruction, setInstruction] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPublicView, setIsPublicView] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadInstruction();
  }, []);

  const loadInstruction = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('t');
      const instructionId = urlParams.get('id');

      let form;
      if (token) {
        setIsPublicView(true);
        const response = await validateLink({ t: token });
        if (!response.data?.valid) throw new Error(response.data?.error || 'קישור לא תקין');
        form = response.data.form;
      } else if (instructionId) {
        setIsPublicView(false);
        form = await getEntityById(await import('@/entities/PostSurgeryInstructions').then(m => m.PostSurgeryInstructions), instructionId, 'הנחיות');
      } else {
        throw new Error('חסר מזהה לטעינת ההנחיות.');
      }
      
      setInstruction(form);

      if (form.clinic_id) {
        const { Clinic } = await import('@/entities/Clinic');
        const clinics = await Clinic.filter({ id: form.clinic_id });
        if (clinics && clinics.length > 0) setClinic(clinics[0]);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="xl" /></div>;
  }
  if (error) {
    return <div className="p-6"><Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert></div>;
  }
  if (!instruction) {
    return <div className="p-6"><Alert>לא נמצאו הנחיות.</Alert></div>;
  }
  
  const pageContainerClass = isPublicView
    ? "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4 md:p-8"
    : "p-4 md:p-6";

  return (
    <div className={pageContainerClass} dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        {!isPublicView && (
          <PageHeader title="צפייה בהנחיות שחרור" onBack={() => navigate(createPageUrl('PostSurgeryInstructions'))} backButton={true} />
        )}
        
        {isPublicView && (
          <Card className="bg-white/90 backdrop-blur-sm border-blue-200 shadow-xl">
             <CardHeader className="text-center border-b bg-gradient-to-r from-blue-50 to-teal-50">
              <div className="flex justify-center mb-4">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f52f5441f_Teddylogoinhamra.png" alt="טדי וטס לוגו" className="w-20 h-20 object-contain" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">הנחיות לאחר ניתוח</CardTitle>
              {clinic && <p className="text-slate-600 mt-1">{clinic.name}</p>}
            </CardHeader>
          </Card>
        )}

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <DetailItem label="בעלים" value={instruction.owner_name} />
                <DetailItem label="חיית מחמד" value={instruction.pet_name} />
                <DetailItem label="סוג ניתוח" value={instruction.surgery_type} />
                <DetailItem label="תאריך ניתוח" value={formatDateInIsrael(instruction.surgery_date)} />
              </div>
              <Badge className={statusConfig[instruction.status]?.color || ''}>{statusConfig[instruction.status]?.label || instruction.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 border-t">
            <InstructionSection icon={Clock} title="צום, אוכל ושתיה">
              <p>יש להמשיך צום עד שעה <span className="font-bold">{instruction.fasting_until_hour || 'לא צוין'}</span>.</p>
              <p>{instruction.feeding_instructions || 'לא צוינו הנחיות האכלה.'}</p>
            </InstructionSection>

            <InstructionSection icon={Stethoscope} title="טיפול בפצע הניתוח">
              <p>מיקום התפר/חתך: <span className="font-bold">{instruction.wound_location || 'לא צוין'}</span>.</p>
              <p>יש להשגיח שהפצע נקי ויבש. אין לאפשר לחיה ללקק את האזור. מומלץ להשתמש בקולר אליזבת.</p>
            </InstructionSection>

            <InstructionSection icon={Pill} title="טיפול תרופתי">
              <DetailItem label="אנטיביוטיקה" value={instruction.antibiotic_name} />
              {instruction.antibiotic_instructions && <p className="text-sm pl-4">{instruction.antibiotic_instructions}</p>}
              <DetailItem label="שיכוך כאבים" value={instruction.pain_medication_name} />
              {instruction.pain_medication_instructions && <p className="text-sm pl-4">{instruction.pain_medication_instructions}</p>}
              <DetailItem label="תרופה נוספת" value={instruction.additional_medication_name} />
              {instruction.additional_medication_instructions && <p className="text-sm pl-4">{instruction.additional_medication_instructions}</p>}
            </InstructionSection>

            <InstructionSection icon={Calendar} title="ביקורת ומעקב">
              <p>תאריך לביקורת: <span className="font-bold">{instruction.followup_date ? formatDateInIsrael(instruction.followup_date) : 'לא נקבע'}</span>.</p>
            </InstructionSection>

            {instruction.special_instructions && (
              <InstructionSection icon={AlertTriangle} title="הנחיות מיוחדות">
                <p>{instruction.special_instructions}</p>
              </InstructionSection>
            )}
          </CardContent>
          
          {clinic && (
            <CardFooter className="bg-slate-50 p-4 border-t">
              <div className="text-sm text-slate-600 space-y-1">
                <p className="font-bold">{clinic.name}</p>
                <p><MapPin className="inline w-4 h-4 ml-1" />{clinic.address}</p>
                <p><Phone className="inline w-4 h-4 ml-1" />{clinic.phone}</p>
                <p><Mail className="inline w-4 h-4 ml-1" />{clinic.email}</p>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

// Re-using statusConfig from the list page for consistency
const statusConfig = {
    draft: { label: "טיוטה", color: "bg-gray-100 text-gray-800"},
    published: { label: "מוכן לשליחה", color: "bg-blue-100 text-blue-800"},
    sent: { label: "נשלח", color: "bg-green-100 text-green-800"},
    archived: { label: "בארכיון", color: "bg-red-100 text-red-800"}
};
