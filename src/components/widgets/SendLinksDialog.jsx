
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Mail, MessageSquare, Loader2, CheckCircle, Send } from 'lucide-react';
import { Clinic, IntakeForm } from '@/entities/all';
import { getEntityList, createEntity } from '../utils/apiHelpers';
import { createFormLink } from '@/functions/createFormLink';
import { copyToClipboard } from '../utils/urlHelpers';
import { isProduction } from '@/components/dev/detectEnv';

const SendLinksDialog = ({ defaultClinicId, isOpen, onClose }) => {
  const [formType, setFormType] = useState('intake');
  const [clinics, setClinics] = useState([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(true);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [params, setParams] = useState({ owner: '', phone: '', email: '', pet: '', procedure: '' });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const loadClinics = async () => {
      try {
        setIsLoadingClinics(true);
        const activeClinics = await getEntityList(Clinic, { is_active: true });
        setClinics(activeClinics);
        if (activeClinics.length > 0) {
          const clinicToSelect = activeClinics.find(c => c.id === defaultClinicId) || activeClinics[0];
          setSelectedClinic(clinicToSelect);
        }
      } catch (error) {
        console.error("Failed to load clinics", error);
        setError("שגיאה בטעינת המרפאות.");
      } finally {
        setIsLoadingClinics(false);
      }
    };
    if (isOpen) {
      loadClinics();
      // Reset state on open
      setGeneratedLink('');
      setError('');
      setShowSuccess(false);
      setParams({ owner: '', phone: '', email: '', pet: '', procedure: '' });
    }
  }, [isOpen, defaultClinicId]);

  const handleChange = (field, value) => {
    setParams(prev => ({ ...prev, [field]: value }));
    setGeneratedLink(''); // Invalidate previous link on param change
    setShowSuccess(false);
  };
  
  const handleClinicChange = (clinicId) => {
    setSelectedClinic(clinics.find(c => c.id === clinicId));
    setGeneratedLink(''); // Invalidate previous link on clinic change
    setShowSuccess(false);
  };

  const generateLink = async () => {
    if (!selectedClinic) {
      setError("יש לבחור מרפאה.");
      return null;
    }
    
    setIsGenerating(true);
    setError('');
    setShowSuccess(false);
    
    try {
      let url = ''; // Initialize url

      if (formType === 'emergency_triage') {
        // Emergency Triage - קישור ציבורי ישיר ללא טוקן
        url = `${window.location.origin}/PublicEmergencyTriage`;
        setGeneratedLink(url);
        setShowSuccess(true);
        return url; // Early return for direct public link
      }
      
      if (formType === 'intake') {
        // יצירת טופס היכרות טיוטה עם פרטים מינימליים
        const intakeData = {
          clinic_id: selectedClinic.id,
          owner_name: params.owner || '',
          owner_phone: params.phone || '',
          owner_email: params.email || '',
          pet_name: params.pet || '',
          status: 'draft',
        };
        const newIntakeForm = await createEntity(IntakeForm, intakeData, 'IntakeForm');
        
        // יצירת קישור מאובטח
        const linkResponse = await createFormLink({
          form_type: 'intake',
          clinic_id: selectedClinic.id,
          form_id: newIntakeForm.id,
          metadata: {
            owner_name: params.owner,
            pet_name: params.pet,
          }
        });

        const token = linkResponse.data?.token;
        if (!token) {
          throw new Error("לא התקבל טוקן מהשרת.");
        }

        url = `${window.location.origin}/PublicForm?t=${token}`;
        
      } else if (formType === 'anxiety_questionnaire') {
        const { AnxietyQuestionnaire } = await import('@/entities/all');
        const anxietyData = {
          clinic_id: selectedClinic.id,
          owner_name: params.owner || '',
          owner_phone: params.phone || '',
          owner_email: params.email || '',
          pet_name: params.pet || '',
          pet_type: 'כלב',
          status: 'draft',
        };
        
        const newAnxietyForm = await createEntity(AnxietyQuestionnaire, anxietyData, 'AnxietyQuestionnaire');
        
        const linkResponse = await createFormLink({
          form_type: 'anxiety_questionnaire',
          clinic_id: selectedClinic.id,
          form_id: newAnxietyForm.id,
          metadata: {
            owner_name: params.owner,
            pet_name: params.pet,
          },
        });

        const token = linkResponse.data?.token;
        if (!token) {
          throw new Error("לא התקבל טוקן מהשרת.");
        }
        
        url = `${window.location.origin}/PublicAnxietyQuestionnaire?t=${token}`;
        
      } else { // consent form
        // טופס הסכמה
        const metadata = {
          owner_name: params.owner || '',
          pet_name: params.pet || '',
          owner_phone: params.phone || '',
          owner_email: params.email || '',
          ...(formType === 'consent' && { procedure_type: params.procedure || '' })
        };

        const linkResponse = await createFormLink({
          form_type: formType,
          clinic_id: selectedClinic.id,
          metadata: metadata,
        });

        const token = linkResponse.data?.token;
        if (!token) throw new Error("לא התקבל טוקן מהשרת.");

        const pageName = 'PublicConsentForm';
        url = `${window.location.origin}/${pageName}?t=${token}`;
      }
      
      setGeneratedLink(url);
      setShowSuccess(true);
      return url;

    } catch (err) {
      console.error("Failed to generate link:", err);
      setError(`שגיאה ביצירת הקישור: ${err.message}`);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (generatedLink) {
      await copyToClipboard(generatedLink);
    }
  };

  const handleWhatsAppShare = () => {
    if (!generatedLink) return;
    if (!isProduction()) {
      alert('שליחה בוואטסאפ מנוטרלת בסביבת בדיקות.');
      return;
    }
    const formTypeName = formType === 'intake' ? 'היכרות' : 
                         (formType === 'consent' ? 'הסכמה' : 
                         (formType === 'anxiety_questionnaire' ? 'שאלון חרדה' : 'טריאז\' חירום'));
    const message = `שלום ${params.owner || ''},\nאנא מלאו את טופס ה${formTypeName} למרפאת טדי וטס:\n\n${generatedLink}`;
    const whatsappUrl = `https://wa.me/${params.phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailShare = () => {
    if (!generatedLink) return;
    if (!isProduction()) {
      alert('שליחה באימייל מנוטרלת בסביבת בדיקות.');
      return;
    }
    const formTypeName = formType === 'intake' ? 'היכרות' : 
                         (formType === 'consent' ? 'הסכמה' : 
                         (formType === 'anxiety_questionnaire' ? 'שאלון חרדה' : 'טריאז\' חירום'));
    const subject = `טופס ${formTypeName} למרפאת טדי וטס`;
    const body = `שלום ${params.owner || ''},\n\nנא למלא את הטופס בקישור הבא:\n${generatedLink}\n\nתודה,\nצוות מרפאות טדי וטס`;
    const mailtoUrl = `mailto:${params.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">יצירת קישור לטופס ציבורי</DialogTitle>
          <DialogDescription>
            צור קישור אישי ומאובטח לשליחה ללקוח. הלקוח ימלא את הטופס בקישור זה.
          </DialogDescription>
        </DialogHeader>

        {!showSuccess ? (
          <>
            <Tabs value={formType} onValueChange={setFormType} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="intake">טופס היכרות</TabsTrigger>
                <TabsTrigger value="consent">טופס הסכמה</TabsTrigger>
                <TabsTrigger value="anxiety_questionnaire">שאלון חרדה</TabsTrigger>
                <TabsTrigger value="emergency_triage">טריאז' חירום</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>סניף המרפאה *</Label>
                <Select 
                  value={selectedClinic?.id || ''} 
                  onValueChange={handleClinicChange} 
                  disabled={isLoadingClinics}
                  dir="rtl"
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingClinics ? "טוען מרפאות..." : "בחר מרפאה"} />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map(clinic => (
                      <SelectItem key={clinic.id} value={clinic.id}>{clinic.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formType !== 'emergency_triage' && (
                <>
                  <div className="space-y-2">
                    <Label>שם הבעלים</Label>
                    <Input 
                      value={params.owner} 
                      onChange={(e) => handleChange('owner', e.target.value)} 
                      placeholder="שם הבעלים (אופציונלי)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>שם חיית המחמד</Label>
                    <Input 
                      value={params.pet} 
                      onChange={(e) => handleChange('pet', e.target.value)} 
                      placeholder="שם החיה (אופציונלי)"
                    />
                  </div>
                  
                  {formType === 'consent' && (
                    <div className="space-y-2">
                      <Label>סוג ההליך</Label>
                      <Input 
                        value={params.procedure} 
                        onChange={(e) => handleChange('procedure', e.target.value)} 
                        placeholder="סוג ההליך (אופציונלי)"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>טלפון (לוואטסאפ)</Label>
                    <Input 
                      type="tel" 
                      value={params.phone} 
                      onChange={(e) => handleChange('phone', e.target.value)} 
                      placeholder="05X-XXXXXXX"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>אימייל</Label>
                    <Input 
                      type="email" 
                      value={params.email} 
                      onChange={(e) => handleChange('email', e.target.value)} 
                      placeholder="example@email.com"
                    />
                  </div>
                </>
              )}

              {formType === 'emergency_triage' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>שימו לב:</strong> קישור זה הוא לטופס טריאז' חירום ציבורי. 
                    הקישור אינו מאובטח באמצעות טוקן ויכול לשמש מספר פעמים.
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                onClick={generateLink} 
                disabled={isGenerating || !selectedClinic}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    יוצר קישור...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 ml-2" />
                    צור קישור
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-6 py-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-800 mb-2">הקישור נוצר בהצלחה!</h3>
                <p className="text-green-700">
                  שלחו את הקישור ללקוח במייל או בוואטסאפ
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <Label className="text-sm font-medium text-slate-700 mb-2 block">הקישור:</Label>
                <div className="flex gap-2">
                  <Input 
                    value={generatedLink} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleWhatsAppShare}
                  disabled={!params.phone}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <MessageSquare className="w-4 h-4 ml-2" />
                  שלח בוואטסאפ
                </Button>
                <Button 
                  onClick={handleEmailShare}
                  disabled={!params.email}
                  variant="outline"
                >
                  <Mail className="w-4 h-4 ml-2" />
                  שלח באימייל
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full"
              >
                סגור
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SendLinksDialog;
