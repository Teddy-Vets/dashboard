import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Heart,
  Stethoscope,
  ArrowLeft,
  MessageSquare,
  User,
  Sparkles,
  ChevronRight,
  Dog,
  Cat,
  Bird,
  Calendar,
  Clock,
  CheckCircle,
  PawPrint,
  ShieldCheck,
  Baby,
  Loader2,
  MessageCircle,
  X,
  AlertCircle,
  Activity,
  Droplets,
  Bone,
  Wind,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppointmentRequest, Clinic } from "@/entities/all";
import { getEntityList, createEntity } from "@/components/utils/apiHelpers";

// --- Reusable Components ---

const WhatsAppButton = () =>
<a
  href="https://wa.me/972548959176?text=היי%20מרפאת%20טדי%20וטס,%20אני%20צריך/ה%20עזרה%20עם%20קביעת%20התור"
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-6 left-6 z-50 bg-green-500 text-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform hover:scale-110 text-sm font-semibold px-3"
  aria-label="Contact us on WhatsApp">
  <MessageSquare className="w-8 h-8" />
</a>;


const StepLayout = ({ children, onBack, hideBackButton = false }) =>
<div className="bg-violet-50 rounded min-h-screen">
    <header className="bg-white shadow-sm p-4 sticky top-0 z-20">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {!hideBackButton ? (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
        ) : (
          <div className="w-10"></div>
        )}
        <div className="w-10"></div>
      </div>
    </header>
    <main className="mx-auto pt-6 pr-6 pb-6 pl-6 max-w-md">
      {children}
    </main>
  </div>;


// --- Screen Components ---

const ContactDetailsScreen = ({ formData, setFormData, onNext, onBack }) => {
  const isFormValid = formData.petName && formData.ownerName && formData.ownerPhone && formData.ownerEmail && formData.clinic_id && formData.petType;
  const [clinics, setClinics] = useState([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(true);

  useEffect(() => {
    async function fetchClinics() {
      try {
        const clinicList = await getEntityList(Clinic, { is_active: true });
        setClinics(clinicList);
        // הסרת ברירת מחדל - הלקוח יבחר בעצמו
      } catch (error) {
        console.error("Failed to load clinics", error);
      } finally {
        setIsLoadingClinics(false);
      }
    }
    fetchClinics();
  }, []);

  return (
    <StepLayout hideBackButton={true}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            שמחים מאוד שבחרתם להגיע עם החבר הפרוותי אלינו
          </h2>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="font-semibold text-gray-700 mb-3 block text-lg">בחרו מרפאה *</Label>
            {isLoadingClinics ?
            <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div> :

            <div className="grid grid-cols-3 gap-3">
                {clinics.map((clinic) =>
              <Card
                key={clinic.id}
                onClick={() => setFormData({ ...formData, clinic_id: clinic.id, clinic_name: clinic.name })}
                className={`cursor-pointer border-2 transition-all duration-200 h-24 flex items-center justify-center ${
                formData.clinic_id === clinic.id ?
                'border-blue-500 bg-blue-50 shadow-md' :
                'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'}`
                }>

                    <CardContent className="p-4 text-center w-full">
                      <div className={`font-semibold text-sm break-words ${
                  formData.clinic_id === clinic.id ? 'text-blue-800' : 'text-gray-700'}`
                  }>
                        {clinic.name}
                      </div>
                      {formData.clinic_id === clinic.id &&
                  <div className="mt-2 flex justify-center">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                  }
                    </CardContent>
                  </Card>
              )}

                <Card className="border-2 border-dashed border-gray-300 h-24 flex items-center justify-center bg-gray-50/50">
                  <CardContent className="p-4 text-center w-full">
                    <div className="font-semibold text-sm text-gray-400">
                      בקרוב
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      מרפאה נוספת
                    </div>
                  </CardContent>
                </Card>
              </div>
            }
          </div>

          <div>
            <Label className="font-semibold text-gray-700 mb-3 block text-lg">סוג החיה *</Label>
            <div className="grid grid-cols-2 gap-4">
              <Card
                onClick={() => setFormData({ ...formData, petType: 'כלב' })}
                className={`cursor-pointer border-2 transition-all duration-200 h-24 flex items-center justify-center ${
                formData.petType === 'כלב' ?
                'border-blue-500 bg-blue-50 shadow-md' :
                'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'}`
                }>

                <CardContent className="p-4 text-center flex flex-col items-center gap-2">
                  <Dog className={`w-8 h-8 ${formData.petType === 'כלב' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`font-semibold text-sm ${formData.petType === 'כלב' ? 'text-blue-800' : 'text-gray-700'}`}>
                    כלב
                  </span>
                </CardContent>
              </Card>

              <Card
                onClick={() => setFormData({ ...formData, petType: 'חתול' })}
                className={`cursor-pointer border-2 transition-all duration-200 h-24 flex items-center justify-center ${
                formData.petType === 'חתול' ?
                'border-blue-500 bg-blue-50 shadow-md' :
                'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'}`
                }>

                <CardContent className="p-4 text-center flex flex-col items-center gap-2">
                  <Cat className={`w-8 h-8 ${formData.petType === 'חתול' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`font-semibold text-sm ${formData.petType === 'חתול' ? 'text-blue-800' : 'text-gray-700'}`}>
                    חתול
                  </span>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <Label htmlFor="petName" className="font-semibold text-gray-700 mb-2 block">🐶🐱 איך קוראים לכוכב/ת? *</Label>
            <Input
              id="petName"
              value={formData.petName}
              onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
              className="bg-white"
              placeholder="שם חיית המחמד"
              required />

          </div>

          <div>
            <Label htmlFor="ownerName" className="font-semibold text-gray-700 mb-2 block">השם שלך *</Label>
            <Input
              id="ownerName"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              className="bg-white"
              placeholder="שם הבעלים"
              required />

          </div>

          <div>
            <Label htmlFor="ownerPhone" className="font-semibold text-gray-700 mb-2 block">טלפון *</Label>
            <Input
              id="ownerPhone"
              type="tel"
              value={formData.ownerPhone}
              onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
              className="bg-white"
              required />

          </div>

          <div>
            <Label htmlFor="ownerEmail" className="font-semibold text-gray-700 mb-2 block">אימייל *</Label>
            <Input
              id="ownerEmail"
              type="email"
              value={formData.ownerEmail}
              onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
              className="bg-white"
              placeholder="your@email.com"
              required />

          </div>
        </div>

        <Button
          onClick={onNext}
          disabled={!isFormValid}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-full text-lg font-semibold mt-10">

          לחצו לבחירת שירות
        </Button>
      </motion.div>
    </StepLayout>);

};

const ServiceSelectionScreen = ({ formData, setFormData, onNext, onBack }) =>
<StepLayout onBack={onBack}>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">איך נוכל לעזור לחבר הפרוותי?

    </h2>
      <div className="space-y-4">
        <Card
        onClick={() => {
          setFormData({ ...formData, request_type: 'vaccination' });
          onNext('vaccination');
        }}
        className={`cursor-pointer border-2 p-6 transition-all ${formData.request_type === 'vaccination' ? 'border-blue-400 bg-blue-50' : 'bg-white hover:bg-blue-50/50'}`}>

          <CardContent className="p-0 flex items-center gap-6">
            <ShieldCheck className="w-12 h-12 text-blue-500" />
            <div className="text-right">
              <p className="font-semibold text-xl text-gray-800">חיסון שגרתי / טיפול מונע</p>
            </div>
          </CardContent>
        </Card>
        <Card
        onClick={() => {
          setFormData({ ...formData, request_type: 'medical_visit' });
          onNext('medical_visit');
        }}
        className={`cursor-pointer border-2 p-6 transition-all ${formData.request_type === 'medical_visit' ? 'border-blue-400 bg-blue-50' : 'bg-white hover:bg-blue-50/50'}`}>

          <CardContent className="p-0 flex items-center gap-6">
            <Heart className="w-12 h-12 text-blue-500" />
            <div className="text-right">
              <p className="font-semibold text-xl text-gray-800">בדיקה / כי משהו קצת מדאיג</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  </StepLayout>;


const VaccinationDetailsScreen = ({ formData, setFormData, onNext, onBack }) => {
  const [selectedVaccines, setSelectedVaccines] = useState(formData.vaccination_types || []);
  const [showSpecialMessage, setShowSpecialMessage] = useState(false);

  const vaccineOptions = [
  { id: 'hexagon', name: 'משושה', icon: ShieldCheck, requiresConfirmation: false },
  { id: 'heartworm', name: 'טיפול תולעת הפארק', icon: Heart, requiresConfirmation: false },
  { id: 'deworming', name: 'תילוע', icon: Heart, requiresConfirmation: false },
  { id: 'rabies', name: 'כלבת', icon: ShieldCheck, requiresConfirmation: true },
  { id: 'kennel_cough', name: 'שעלת', icon: Heart, requiresConfirmation: true },
  { id: 'puppy_first', name: 'טיפול ראשון לגורים', icon: Baby, hasPuppyIcon: true }];


  const handleVaccineToggle = (vaccineId) => {
    const newSelection = selectedVaccines.includes(vaccineId) ?
    selectedVaccines.filter((id) => id !== vaccineId) :
    [...selectedVaccines, vaccineId];

    setSelectedVaccines(newSelection);
    setFormData((prev) => ({ ...prev, vaccination_types: newSelection }));

    const requiresConfirmation = newSelection.some((id) =>
    vaccineOptions.find((v) => v.id === id && v.requiresConfirmation)
    );
    setShowSpecialMessage(requiresConfirmation);
  };

  const handleNextClick = () => {
    if (selectedVaccines.length > 0) {
      onNext();
    }
  };

  const handleNotSureClick = () => {
    setFormData((prev) => ({
      ...prev,
      vaccination_types: prev.vaccination_types.length > 0 ? prev.vaccination_types : selectedVaccines, // Keep existing selections if any, or add current selected
      notes: prev.notes ? `${prev.notes}. לא בטוח בחיסונים הנדרשים` : 'לא בטוח בחיסונים הנדרשים'
    }));
    onNext();
  };

  return (
    <StepLayout onBack={onBack}>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="space-y-6">

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            אילו חיסונים נדרשים?
          </h2>
          <p className="text-gray-600 px-3 py-1 text-sm">בחרו את החיסונים שחיית המחמד שלכם צריכה, אם אינכם בטוחים, המשיכו לתאום המועד הרצוי ואנו נחזור אליכם בהקדם

          </p>
        </div>

        {/* 4) שני טורים */}
        <div className="grid grid-cols-2 gap-3">
          {vaccineOptions.map((vaccine) => {
            const Icon = vaccine.icon;
            const isSelected = selectedVaccines.includes(vaccine.id);

            return (
              <Card
                key={vaccine.id}
                onClick={() => handleVaccineToggle(vaccine.id)}
                className={`cursor-pointer border-2 transition-all duration-200 ${
                isSelected ?
                'border-blue-500 bg-blue-50' :
                'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`
                }>

                <CardContent className="p-4 flex flex-col items-center justify-between h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="text-red-100 lucide lucide-shield-check w-5 h-5" />
                    {/* 6) אייקון גור */}
                    {vaccine.hasPuppyIcon &&
                    <Baby className={`w-4 h-4 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
                    }
                  </div>
                  <span className={`font-medium text-sm text-center ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                    {vaccine.name}
                  </span>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-2 ${
                  isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`
                  }>
                    {isSelected &&
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    }
                  </div>
                </CardContent>
              </Card>);

          })}
        </div>

        {showSpecialMessage &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-lg p-4">

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <div>
                <h4 className="font-semibold text-amber-800 mb-1">שימו לב</h4>
                <p className="text-amber-700 text-sm leading-relaxed">
                  בחרתם חיסון שדורש תיאום מיוחד. התור שלכם אינו סופי - צוות המרפאה יחזור אליכם בהקדם לקביעת מועד מדויק ופרטים נוספים.
                </p>
              </div>
            </div>
          </motion.div>
        }

        <div className="space-y-3">
          <Button
            onClick={handleNextClick}
            disabled={selectedVaccines.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-full">

            המשך לבחירת תאריך
          </Button>

          <Button
            onClick={handleNotSureClick}
            variant="outline"
            className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-4 text-lg font-semibold rounded-full">

            לא בטוח אבל נשריין תור
          </Button>
        </div>
      </motion.div>
    </StepLayout>);

};

const MedicalVisitDetailsScreen = ({ formData, setFormData, onNext, onBack }) => {
  const [selectedReasons, setSelectedReasons] = useState(
    formData.medical_reason ? formData.medical_reason.split(', ').filter(Boolean) : []
  );
  const [customReason, setCustomReason] = useState('');

  const commonReasons = [
  { id: 'emergency', label: 'חירום - דורש טיפול מיידי!', icon: AlertCircle, isEmergency: true },
  { id: 'checkup', label: 'בדיקה שגרתית', icon: Stethoscope },
  { id: 'digestive', label: 'בעיות עיכול', icon: Activity },
  { id: 'skin', label: 'בעיות עור ופרווה', icon: Droplets },
  { id: 'teeth', label: 'בעיות שיניים', icon: Bone },
  { id: 'injury', label: 'פציעה או כאב', icon: Heart },
  { id: 'breathing', label: 'בעיות נשימה', icon: Wind },
  { id: 'other', label: 'אחר', icon: HelpCircle }];


  const handleReasonToggle = (reasonLabel) => {
    setSelectedReasons((prev) => {
      if (prev.includes(reasonLabel)) {
        return prev.filter((r) => r !== reasonLabel);
      } else {
        return [...prev, reasonLabel];
      }
    });
  };

  const handleNextClick = () => {
    const allReasons = [...selectedReasons];
    if (customReason.trim() && !allReasons.includes(customReason.trim())) {
      allReasons.push(customReason.trim());
    }

    if (allReasons.length > 0) {
      setFormData((prev) => ({ ...prev, medical_reason: allReasons.join(', ') }));
      onNext();
    }
  };

  const isReasonSelected = (reasonLabel) => selectedReasons.includes(reasonLabel);

  return (
    <StepLayout onBack={onBack}>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="space-y-6">

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            ספרו לנו, איך נוכל לעזור?
          </h2>
          <p className="text-gray-600">
            אל דאגה, אפשר לבחור כמה אפשרויות.
          </p>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium text-gray-700 mb-2 block">
            בחרו מהרשימה:
          </Label>

          <div className="grid grid-cols-3 gap-3">
            {commonReasons.map((reason) => {
              const isSelected = isReasonSelected(reason.label);
              const Icon = reason.icon;

              return (
                <Card
                  key={reason.id}
                  onClick={() => handleReasonToggle(reason.label)}
                  className={`cursor-pointer border-2 transition-all duration-200 h-24 flex items-center justify-center ${
                  reason.isEmergency ?
                  isSelected ?
                  'border-red-500 bg-red-500 shadow-lg' :
                  'border-red-400 bg-red-500 hover:bg-red-600 shadow-md' :
                  isSelected ?
                  'border-blue-500 bg-blue-50' :
                  'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'}`
                  }>

                  <CardContent className="p-3 text-center w-full">
                    <div className="flex flex-col items-center gap-2">
                      <Icon className={`w-5 h-5 ${
                      reason.isEmergency ?
                      'text-white' :
                      isSelected ? 'text-blue-600' : 'text-gray-500'}`
                      } />
                      <span className={`font-medium text-xs leading-tight block ${
                      reason.isEmergency ?
                      'text-white' :
                      isSelected ? 'text-blue-800' : 'text-gray-700'}`
                      }>
                        {reason.label}
                      </span>
                    </div>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mx-auto mt-2 ${
                    isSelected ?
                    reason.isEmergency ?
                    'bg-white border-white' :
                    'bg-blue-500 border-blue-500' :
                    reason.isEmergency ?
                    'border-white' :
                    'border-gray-300'}`
                    }>
                      {isSelected &&
                      <svg className={`w-3 h-3 ${reason.isEmergency ? 'text-red-500' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      }
                    </div>
                  </CardContent>
                </Card>);

            })}
          </div>

          <div className="mt-6">
            <Label className="text-base font-medium text-gray-700 mb-2 block">
              או כתבו בעצמכם:
            </Label>
            <Textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="תארו בפירוט נוסף..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="4" />

          </div>
        </div>

        <Button
          onClick={handleNextClick}
          disabled={selectedReasons.length === 0 && !customReason.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-full mt-8">

          המשך לבחירת תאריך
        </Button>
      </motion.div>
    </StepLayout>);

};

const DateTimeSelectionScreen = ({ formData, setFormData, onNext, onBack }) => {
  const [selectedDate, setSelectedDate] = useState(formData.preferred_date || '');
  const [selectedTime, setSelectedTime] = useState(formData.preferred_time || '');

  const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00'];


  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleNextClick = () => {
    if (selectedDate && selectedTime) {
      setFormData((prev) => ({
        ...prev,
        preferred_date: selectedDate,
        preferred_time: selectedTime
      }));
      onNext();
    }
  };

  return (
    <StepLayout onBack={onBack}>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="space-y-6">

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            מעולה! בחרו מועד מועדף
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {formData.request_type === 'vaccination' ?
            'בחרו את היום והשעה שהכי נוחים לכם. התור יקבע ישירות ביומן המרפאה.' :
            'אנא בחרו את היום והשעה שהכי נוחים לכם. נציג מהמרפאה ייצור עמכם קשר טלפוני בהקדם כדי לאשר את המועד הסופי והמדויק.'}
          </p>
        </div>

        <div className="space-y-6">
          {/* בחירת תאריך */}
          <div>
            <Label className="text-base font-medium text-gray-700 mb-3 block">
              <Calendar className="inline-block w-5 h-5 ml-1 text-gray-50" /> תאריך מועדף
            </Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              className="w-full text-lg p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500" />

          </div>

          {/* בחירת שעה */}
          {selectedDate &&
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}>

              <Label className="text-base font-medium text-gray-700 mb-3 block">
                <Clock className="inline-block w-5 h-5 ml-1 text-gray-500" /> שעה מועדפת
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map((time) =>
              <Button
                key={time}
                type="button"
                variant={selectedTime === time ? "default" : "outline"}
                onClick={() => setSelectedTime(time)}
                className={`p-3 text-center ${
                selectedTime === time ?
                'bg-blue-600 text-white' :
                'hover:bg-blue-50 hover:border-blue-300'}`
                }>

                    {time}
                  </Button>
              )}
              </div>
            </motion.div>
          }
        </div>

        <Button
          onClick={handleNextClick}
          disabled={!selectedDate || !selectedTime}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-full mt-8">

          המשך לסיכום
        </Button>
      </motion.div>
    </StepLayout>);

};

const ConfettiPiece = ({ delay, color, size }) =>
<motion.div
  className={`absolute w-${size} h-${size} ${color} rounded-full`}
  initial={{
    x: Math.random() * window.innerWidth,
    y: -20,
    rotate: 0,
    opacity: 1
  }}
  animate={{
    y: window.innerHeight + 50,
    rotate: 360,
    opacity: 0
  }}
  transition={{
    duration: 3 + Math.random() * 2,
    delay: delay,
    ease: "linear"
  }} />;



const Confetti = () => {
  const colors = ['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-red-400'];
  const sizes = ['2', '3', '4'];

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 50 }, (_, i) =>
      <ConfettiPiece
        key={i}
        delay={i * 0.1}
        color={colors[Math.floor(Math.random() * colors.length)]}
        size={sizes[Math.floor(Math.random() * sizes.length)]} />

      )}
    </div>);

};

export default function AppointmentBookingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('contact-details');
  const [formData, setFormData] = useState({
    clinic_id: '',
    clinic_name: '',
    customerType: 'new', // ברירת מחדל - לקוח חדש
    petType: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    petName: '',
    request_type: '',
    vaccination_types: [],
    medical_reason: '',
    preferred_date: '',
    preferred_time: '',
    notes: '',
    signature: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clinics, setClinics] = useState([]);

  useEffect(() => {
    async function fetchClinics() {
      try {
        const clinicList = await getEntityList(Clinic, { is_active: true });
        setClinics(clinicList);
      } catch (error) {
        console.error("Failed to load clinics", error);
      }
    }
    fetchClinics();
  }, []);

  const handleNext = (stepData) => {
    if (stepData && typeof stepData === 'object') {
      setFormData((prev) => ({ ...prev, ...stepData }));
    }

    switch (currentStep) {
      case 'contact-details':
        setCurrentStep('service-selection');
        break;
      case 'service-selection':
        if (stepData === 'vaccination') {
          setCurrentStep('vaccination-details');
        } else {
          setCurrentStep('medical-visit-details');
        }
        break;
      case 'vaccination-details':
      case 'medical-visit-details':
        setCurrentStep('datetime-selection');
        break;
      case 'datetime-selection':
        setCurrentStep('review-and-submit');
        break;
      case 'review-and-submit':
        setCurrentStep('thank-you');
        break;
      default:
        setCurrentStep('contact-details');
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'service-selection':
        setCurrentStep('contact-details');
        break;
      case 'vaccination-details':
        setCurrentStep('service-selection');
        break;
      case 'medical-visit-details':
        setCurrentStep('service-selection');
        break;
      case 'datetime-selection':
        if (formData.request_type === 'vaccination') {
          setCurrentStep('vaccination-details');
        } else {
          setCurrentStep('medical-visit-details');
        }
        break;
      case 'review-and-submit':
        setCurrentStep('datetime-selection');
        break;
      default:
        break;
    }
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        clinic_id: formData.clinic_id,
        customer_type: formData.customerType,
        owner_name: formData.ownerName,
        owner_phone: formData.ownerPhone,
        owner_email: formData.ownerEmail,
        pet_name: formData.petName,
        pet_type: formData.petType || null,
        request_type: formData.request_type,
        vaccination_types: formData.vaccination_types || [],
        medical_reason: formData.medical_reason || null,
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time,
        notes: formData.notes || null,
        signature: formData.signature || null,
        status: 'submitted'
      };

      console.log('[AppointmentBooking] Creating appointment with payload:', payload);
      const appointmentRequest = await createEntity(AppointmentRequest, payload, 'AppointmentRequest');
      console.log('[AppointmentBooking] Appointment created:', appointmentRequest);

      if (appointmentRequest && appointmentRequest.id) {
        try {
          const { base44 } = await import('@/api/base44Client');
          console.log('[AppointmentBooking] Invoking handleAppointmentBooking function...');
          const journeyResult = await base44.functions.invoke('handleAppointmentBooking', appointmentRequest);
          console.log('[AppointmentBooking] Journey result:', journeyResult);
        } catch (journeyError) {
          console.error('[AppointmentBooking] Journey error:', journeyError);
        }
      }

      handleNext();
    } catch (error) {
      console.error('[AppointmentBooking] Error submitting appointment:', error);
      alert('אירעה שגיאה בשליחת הבקשה. אנא נסו שוב או צרו קשר טלפוני.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ReviewScreen = () => {
    const selectedClinic = clinics.find((c) => c.id === formData.clinic_id);

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const getVaccinationNames = (ids) => {
      const vaccineMap = {
        'hexagon': 'משושה',
        'heartworm': 'טיפול תולעת הפארק',
        'deworming': 'תילוע',
        'rabies': 'כלבת',
        'kennel_cough': 'שעלת',
        'puppy_first': 'טיפול ראשון לגורים'
      };
      return ids.map((id) => vaccineMap[id] || id).join(', ');
    };

    const getServiceLabel = () => {
      if (formData.request_type === 'vaccination') {
        return formData.vaccination_types && formData.vaccination_types.length > 0 ?
        getVaccinationNames(formData.vaccination_types) :
        'חיסון שגרתי';
      }
      return formData.medical_reason || 'בדיקה/ביקור רפואי';
    };

    return (
      <StepLayout onBack={handleBack}>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="space-y-6">

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              מעולה! מבט אחרון על פרטי הבקשה
            </h2>
            {formData.request_type === 'medical_visit' &&
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <p className="text-blue-800 font-semibold">
                  💬 שימו לב: נציג מהמרפאה ייצור עמכם קשר טלפוני בהקדם כדי לאשר את המועד הסופי והמדויק.
                </p>
              </div>
            }
          </div>

          <Card className="bg-white border-2 border-gray-200">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium text-gray-600">מרפאה:</span>
                <span className="font-semibold text-gray-800">{selectedClinic?.name || 'לא צוין'}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium text-gray-600">שם הבעלים:</span>
                <span className="font-semibold text-gray-800">{formData.ownerName}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium text-gray-600">שם חיית המחמד:</span>
                <span className="font-semibold text-gray-800">{formData.petName}</span>
              </div>
              {formData.petType &&
              <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium text-gray-600">סוג החיה:</span>
                  <span className="font-semibold text-gray-800">{formData.petType}</span>
                </div>
              }
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium text-gray-600">טלפון:</span>
                <span className="font-semibold text-gray-800">{formData.ownerPhone}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium text-gray-600">אימייל:</span>
                <span className="font-semibold text-gray-800">{formData.ownerEmail}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium text-gray-600">סוג הביקור:</span>
                <span className="font-semibold text-gray-800">
                  {formData.request_type === 'vaccination' ? 'חיסון' : 'ביקור רפואי'}
                </span>
              </div>
              <div className="flex justify-between items-start border-b pb-2">
                <span className="font-medium text-gray-600">שירות:</span>
                <span className="font-semibold text-gray-800 text-right">{getServiceLabel()}</span>
              </div>
              {formData.notes &&
              <div className="flex justify-between items-start border-b pb-2">
                  <span className="font-medium text-gray-600">הערות:</span>
                  <span className="font-semibold text-gray-800 text-right">{formData.notes}</span>
                </div>
              }
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium text-gray-600">תאריך מועדף:</span>
                <span className="font-semibold text-gray-800">{formatDate(formData.preferred_date)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">שעה מועדפת:</span>
                <span className="font-semibold text-gray-800">{formData.preferred_time}</span>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1">

              חזרה
            </Button>
            <Button
              onClick={handleSubmitBooking}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">

              {isSubmitting ?
              <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  שולח...
                </> :

              <>
                  <CheckCircle className="w-5 h-5 ml-2" />
                  אישור וקביעת התור
                </>
              }
            </Button>
          </div>
        </motion.div>
      </StepLayout>);

  };

  const SuccessScreen = () => {
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }, []);

    const handleAddToCalendar = () => {
      const startDate = new Date(`${formData.preferred_date}T${formData.preferred_time}`);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

      const formatDateForCalendar = (date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
      };

      const title = encodeURIComponent(`תור במרפאת טדי וטס - ${formData.petName}`);
      const details = encodeURIComponent(`ביקור ${formData.request_type === 'vaccination' ? 'חיסון' : 'רפואי'} עבור ${formData.petName}`);
      const location = encodeURIComponent('מרפאת טדי וטס');

      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}&details=${details}&location=${location}`;

      window.open(googleCalendarUrl, '_blank');
    };

    const handleClose = () => {
      window.location.href = '/AppointmentBooking';
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center p-6 relative overflow-hidden">
        {showConfetti && <Confetti />}

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full relative z-10">

          <Card className="border-none shadow-2xl relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="absolute top-4 left-4 z-20 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
              aria-label="סגור">

              <X className="w-5 h-5" />
            </Button>

            <CardContent className="p-8 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">

                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>

              <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-3">
                  🎉 מעולה, {formData.ownerName}!
                </h2>
                <p className="text-lg text-slate-600">
                  אנחנו כבר מחכים לפגוש את {formData.petName}!
                </p>
                {formData.request_type === 'medical_visit' ?
                <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-300 rounded-xl max-w-md mx-auto">
                    <p className="text-blue-900 font-semibold text-lg mb-2">
                      📞 בקשתכם לתור התקבלה בהצלחה!
                    </p>
                    <p className="text-blue-800 text-sm">
                      ⚠️ שימו לב: התור עדיין לא נקבע באופן סופי. נציג מהמרפאה ייצור עמכם קשר טלפוני בהקדם כדי לאשר ולקבוע את התאריך והשעה המדויקים של התור.
                    </p>
                    <p className="text-blue-800 text-sm mt-2">
                      💌 קיבלתם אישור קבלה למייל ול-SMS עם כל הפרטים.
                    </p>
                  </div> :

                <div className="mt-6 p-6 bg-green-50 border-2 border-green-300 rounded-xl max-w-md mx-auto">
                    <p className="text-green-900 font-semibold text-lg mb-2">
                      ✅ התור שלכם נקבע בהצלחה!
                    </p>
                    <p className="text-green-800 text-sm">
                      💌 קיבלתם אישור עם כל הפרטים למייל ול-SMS. נציג מהמרפאה ייצור עמכם קשר בהקדם לאישור סופי.
                    </p>
                  </div>
                }
              </div>

              <div className="space-y-3 pt-6">
                <Button
                  onClick={handleAddToCalendar}
                  className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">

                  <Calendar className="w-5 h-5 ml-2" />
                  הוספה ליומן שלי
                </Button>

                <a
                  href="https://wa.me/972548959176?text=היי,%20יש%20לי%20שאלה%20לגבי%20התור"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block">

                  <Button
                    variant="outline"
                    className="w-full max-w-md mx-auto">

                    <MessageCircle className="w-5 h-5 ml-2" />
                    יש שאלה? דברו איתנו
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>);

  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'contact-details':
        return <ContactDetailsScreen formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />;
      case 'service-selection':
        return <ServiceSelectionScreen formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />;
      case 'vaccination-details':
        return <VaccinationDetailsScreen formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />;
      case 'medical-visit-details':
        return <MedicalVisitDetailsScreen formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />;
      case 'datetime-selection':
        return <DateTimeSelectionScreen formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />;
      case 'review-and-submit':
        return <ReviewScreen />;
      case 'thank-you':
        return <SuccessScreen />;
      default:
        return <ContactDetailsScreen formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />;
    }
  };

  return (
    <div dir="rtl" className="min-h-screen">
      <AnimatePresence mode="wait">
        {renderCurrentStep()}
      </AnimatePresence>
      {currentStep !== 'thank-you' && <WhatsAppButton />}
    </div>);

}