
import React, { useState, useEffect } from 'react';
import { SpayNeuterInstructions, Clinic } from '@/entities/all';
import { useNavigate } from "react-router-dom";
import { createPageUrl, copyToClipboard, shareViaWhatsApp, shareViaEmail } from "@/components/utils/urlHelpers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Download,
  Send,
  CheckCircle,
  Archive,
  PawPrint,
  User,
  Calendar,
  Pill,
  Stethoscope,
  AlertTriangle,
  Copy,
  Share2,
  Loader2
} from "lucide-react"; // Removed ArrowLeft, Scissors, Clock as per outline or if not used.
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { getEntityById, updateEntity } from "@/components/utils/apiHelpers"; // Added updateEntity
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import PageHeader from '@/components/common/PageHeader';
import userService from '@/components/services/userService'; // New import
import { createFormLink } from '@/functions/createFormLink'; // New import
import { generateSpayNeuterInstructionsPDF } from '@/functions/generateSpayNeuterInstructionsPDF'; // New import
// Removed 'motion' from framer-motion as it's imported but not used in the outline,
// and adding it without usage would be dead code.

const DetailSection = ({ title, icon: Icon, children, color = "text-slate-700" }) => (
  <Card className="bg-white/80 backdrop-blur-sm">
    <CardHeader>
      <CardTitle className={`flex items-center gap-2 text-xl ${color}`}>
        <Icon className="w-5 h-5" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3 text-slate-600 text-base leading-relaxed">
      {children}
    </CardContent>
  </Card>
);

const DetailItem = ({ label, value }) => (
  value ? <div><strong className="font-semibold text-slate-800">{label}:</strong> {value}</div> : null
);

export default function ViewSpayNeuterInstructionsPage() { // Renamed component
  const navigate = useNavigate();
  const [instruction, setInstruction] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // New state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false); // New state
  const [isGeneratingLink, setIsGeneratingLink] = useState(false); // New state
  const [publicUrl, setPublicUrl] = useState(''); // New state

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await userService.getCurrentUser();
      setCurrentUser(user);

      const urlParams = new URLSearchParams(window.location.search);
      const instructionId = urlParams.get('id');

      if (!instructionId) {
        throw new Error('מזהה הוראות חסר');
      }

      const instructionData = await getEntityById(SpayNeuterInstructions, instructionId, 'SpayNeuterInstructions');
      setInstruction(instructionData);

      if (instructionData.clinic_id) {
        try {
          const clinicData = await getEntityById(Clinic, instructionData.clinic_id, 'Clinic');
          setClinic(clinicData);
        } catch (e) {
          console.warn('Could not load clinic:', e);
        }
      }
    } catch (error) {
      console.error('Error loading spay/neuter instructions:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // New status configuration object
  const statusConfig = {
    draft: { label: 'טיוטה', color: 'bg-gray-100 text-gray-800', icon: FileText },
    published: { label: 'מפורסם', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    sent: { label: 'נשלח', color: 'bg-green-100 text-green-800', icon: Send },
    archived: { label: 'בארכיון', color: 'bg-slate-100 text-slate-800', icon: Archive }
  };

  // New function to handle status changes
  const handleStatusChange = async (newStatus) => {
    if (!instruction) return;

    try {
      const updateData = { status: newStatus };

      if (newStatus === 'published' && !instruction.published_at) {
        updateData.published_at = new Date().toISOString();
        updateData.published_by = currentUser?.email;
        updateData.version_number = (instruction.version_number || 0) + 1;
      }

      if (newStatus === 'sent' && !instruction.sent_at) {
        updateData.sent_at = new Date().toISOString();
      }

      await updateEntity(SpayNeuterInstructions, instruction.id, updateData, 'SpayNeuterInstructions');

      setInstruction(prev => ({ ...prev, ...updateData }));
      alert(`הסטטוס עודכן ל: ${statusConfig[newStatus].label}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('שגיאה בעדכון הסטטוס');
    }
  };

  // New function to generate PDF
  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const response = await generateSpayNeuterInstructionsPDF({
        instruction_id: instruction.id
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `הנחיות-עיקור-סירוס-${instruction.pet_name}-${format(new Date(), 'dd-MM-yyyy')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('שגיאה ביצירת PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // New function to generate public link
  const handleGenerateLink = async () => {
    setIsGeneratingLink(true);
    try {
      const linkResponse = await createFormLink({
        form_type: 'spay_neuter_instructions',
        clinic_id: instruction.clinic_id,
        form_id: instruction.id,
        metadata: {
          owner_name: instruction.owner_name,
          pet_name: instruction.pet_name
        }
      });

      const token = linkResponse.data?.token;
      if (!token) {
        throw new Error('לא התקבל טוקן מהשרת');
      }

      const url = `${window.location.origin}/PublicSpayNeuterInstructions?t=${token}`;
      setPublicUrl(url);
    } catch (error) {
      console.error('Error generating link:', error);
      alert('שגיאה ביצירת קישור');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  // New function to copy link
  const handleCopyLink = async () => {
    if (!publicUrl) {
      await handleGenerateLink();
      return;
    }
    try {
      await copyToClipboard(publicUrl);
      alert('הקישור הועתק!');
    } catch (error) {
      console.error('Error copying link:', error);
      alert('שגיאה בהעתקת הקישור');
    }
  };

  // New function to share via WhatsApp
  const handleShareWhatsApp = async () => {
    if (!publicUrl) {
      await handleGenerateLink();
      return;
    }
    const message = `שלום ${instruction.owner_name || ''},\nהנה ההנחיות לטיפול לאחר עיקור/סירוס עבור ${instruction.pet_name}:\n\n${publicUrl}`;
    shareViaWhatsApp(message); // shareViaWhatsApp expects message, not url and message
  };

  // New function to share via Email
  const handleShareEmail = async () => {
    if (!publicUrl) {
      await handleGenerateLink();
      return;
    }
    const subject = `הנחיות עיקור/סירוס - ${instruction.pet_name}`;
    const body = `שלום ${instruction.owner_name || ''},\n\nהנה ההנחיות לטיפול לאחר עיקור/סירוס עבור ${instruction.pet_name}:\n${publicUrl}\n\nתודה,\nצוות ${clinic?.name || 'מרפאות טדי וטס'}`;
    shareViaEmail(subject, body); // shareViaEmail expects subject and body, not url, subject, body
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <PageHeader title="הנחיות עיקור/סירוס" description="שגיאה בטעינת הנתונים" />
          <ErrorMessage error={error} onRetry={loadData} />
        </div>
      </div>
    );
  }

  if (!instruction) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800">
              ההנחיות לא נמצאו
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const config = statusConfig[instruction.status] || statusConfig.draft;
  const StatusIcon = config.icon;

  return (
    <div dir="rtl" className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="הנחיות עיקור/סירוס"
          description={`עבור ${instruction.pet_name} - ${instruction.owner_name}`}
          backButton
          onBack={() => navigate(createPageUrl('SpayNeuterInstructions'))}
        />

        {/* Status and Actions Bar */}
        <Card className="bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className={`${config.color} border flex items-center gap-1`}>
                  <StatusIcon className="w-4 h-4" />
                  {config.label}
                </Badge>
                {instruction.version_number && (
                  <span className="text-sm text-slate-500">גרסה {instruction.version_number}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {instruction.status === 'draft' && (
                  <Button
                    onClick={() => handleStatusChange('published')}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="w-4 h-4 ml-1" />
                    פרסם
                  </Button>
                )}

                {instruction.status === 'published' && (
                  <Button
                    onClick={() => handleStatusChange('sent')}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4 ml-1" />
                    סמן כנשלח
                  </Button>
                )}

                <Button
                  onClick={handleGeneratePDF}
                  disabled={isGeneratingPDF}
                  size="sm"
                  variant="outline"
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 ml-1" />
                  )}
                  הורד PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Options */}
        {instruction.status !== 'draft' && (
          <Card className="bg-white/90 backdrop-blur-sm border-green-100 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-green-500" />
                שיתוף ושליחה ללקוח
              </CardTitle>
            </CardHeader>
            <CardContent>
              {publicUrl ? (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-sm text-slate-600 mb-2">קישור לשליחה:</p>
                    <p className="text-xs font-mono bg-white p-2 rounded border break-all">
                      {publicUrl}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleCopyLink} variant="outline" size="sm">
                      <Copy className="w-4 h-4 ml-1" />
                      העתק
                    </Button>
                    <Button onClick={handleShareWhatsApp} className="bg-green-600 hover:bg-green-700" size="sm">
                      <Share2 className="w-4 h-4 ml-1" />
                      שלח בוואטסאפ
                    </Button>
                    <Button onClick={handleShareEmail} variant="outline" size="sm">
                      <Share2 className="w-4 h-4 ml-1" />
                      שלח במייל
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleGenerateLink}
                  disabled={isGeneratingLink || instruction.status === 'draft'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isGeneratingLink ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                      יוצר קישור...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 ml-1" />
                      צור קישור לשליחה
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Original instruction details display */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">פרטי הניתוח</CardTitle>
            <CardDescription>
              בוצע בתאריך: {format(new Date(instruction.surgery_date), 'd MMMM yyyy', { locale: he })}
              {clinic && ` במרפאת ${clinic.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2"><User className="w-4 h-4 text-blue-500" /><strong>בעלים:</strong> {instruction.owner_name}</div>
            <div className="flex items-center gap-2"><PawPrint className="w-4 h-4 text-orange-500" /><strong>חיה:</strong> {instruction.pet_name}</div>
            <div className="flex items-center gap-2"><Stethoscope className="w-4 h-4 text-pink-500" /><strong>סוג ניתוח:</strong> <Badge className={instruction.surgery_type === 'עיקור' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'}>{instruction.surgery_type}</Badge></div>
          </CardContent>
          {/* Original CardFooter with send/download buttons removed */}
        </Card>

        <div className="space-y-6">
          <DetailSection title="הנחיות למנוחה" icon={Stethoscope} color="text-green-700">
            <p>{instruction.post_op_rest_instructions}</p>
          </DetailSection>

          <DetailSection title="תזונה" icon={Stethoscope} color="text-blue-700">
            <p>{instruction.feeding_instructions}</p>
            <DetailItem label="צום עד שעה" value={instruction.fasting_until_hour} />
          </DetailSection>

          <DetailSection title="טיפול תרופתי" icon={Pill} color="text-red-700">
            <p>{instruction.medication_instructions_general}</p>
            {instruction.antibiotic_name && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
                <strong className="font-semibold text-red-800">אנטיביוטיקה: {instruction.antibiotic_name}</strong>
                <DetailItem label="מינון" value={instruction.antibiotic_dosage} />
                <DetailItem label="תדירות" value={instruction.antibiotic_frequency} />
              </div>
            )}
            {instruction.pain_medication_name && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
                <strong className="font-semibold text-red-800">משכך כאבים: {instruction.pain_medication_name}</strong>
                <DetailItem label="מינון" value={instruction.pain_medication_dosage} />
                <DetailItem label="תדירות" value={instruction.pain_medication_frequency} />
              </div>
            )}
          </DetailSection>

          <DetailSection title="טיפול בפצע וביקורת" icon={Stethoscope} color="text-purple-700"> {/* Changed icon from Scissors to Stethoscope as Scissors is no longer imported for this context explicitly */}
            <p>{instruction.local_wound_care_instructions}</p>
            <DetailItem label="תאריך לביקורת" value={instruction.followup_date ? format(new Date(instruction.followup_date), 'd MMMM yyyy', { locale: he }) : "לא נקבע"} />
          </DetailSection>

          <DetailSection title="למה לצפות לאחר הניתוח" icon={Calendar} color="text-orange-700">
            <p>{instruction.post_op_expectations}</p>
          </DetailSection>

          <CardFooter className="text-center justify-center">
            <p>נכתב ע"י: {instruction.veterinarian_name}</p>
          </CardFooter>
        </div>
      </div>
    </div>
  );
}
