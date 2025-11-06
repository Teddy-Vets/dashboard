import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { 
  ArrowLeft, 
  ArrowRight,
  Heart,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  Sparkles,
  MessageSquare
} from "lucide-react";
import { AppointmentRequest, Clinic } from "@/entities/all";
import { getEntityList, createEntity } from "@/components/utils/apiHelpers";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, isBefore, isAfter } from "date-fns";
import { he } from "date-fns/locale";

// כפתור וואטסאפ צף
const WhatsAppButton = () => (
  <div className="fixed bottom-6 left-6 z-50">
    <Button
      className="rounded-full w-14 h-14 bg-green-500 hover:bg-green-600 text-white shadow-lg"
      onClick={() => {
        const message = "היי מרפאת טדי וטס, אני צריך/ה עזרה עם קביעת התור";
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      }}
    >
      <MessageSquare className="w-6 h-6" />
    </Button>
  </div>
);

// מסך A1: טופס פרטי חיסון
const VaccinationDetailsForm = ({ appointmentData, onNext }) => {
  const [clinics, setClinics] = useState([]);
  const [formData, setFormData] = useState({
    clinic_id: '',
    vaccination_types: [],
    pet_name: '',
    owner_name: appointmentData.customer_info?.ownerName || '',
    owner_phone: appointmentData.customer_info?.phone || '',
    owner_email: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  const vaccinationOptions = [
    'חיסון שישייה (DHPP)',
    'חיסון כלבת',
    'חיסון כנגד שעלת הכלבים',
    'חיסון לימפטגיה',
    'חיסון FeLV (לחתולים)',
    'חיסון FIV (לחתולים)'
  ];

  useEffect(() => {
    const loadClinics = async () => {
      try {
        const clinicsData = await getEntityList(Clinic, { is_active: true });
        setClinics(clinicsData);
        if (clinicsData.length > 0) {
          setFormData(prev => ({ ...prev, clinic_id: clinicsData[0].id }));
        }
      } catch (error) {
        console.error('Error loading clinics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadClinics();
  }, []);

  const handleVaccinationToggle = (vaccination, checked) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        vaccination_types: [...prev.vaccination_types, vaccination]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        vaccination_types: prev.vaccination_types.filter(v => v !== vaccination)
      }));
    }
  };

  const canProceed = formData.clinic_id && 
                    formData.vaccination_types.length > 0 && 
                    formData.pet_name && 
                    formData.owner_name && 
                    formData.owner_phone && 
                    formData.owner_email;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto"
    >
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-blue-100">
        <CardHeader className="border-b border-blue-100">
          <CardTitle className="text-2xl font-bold text-blue-800 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" />
            תיאום תור לחיסון
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* בחירת מרפאה */}
              <div className="space-y-2">
                <Label className="text-lg font-semibold text-slate-700">
                  בחירת מרפאה *
                </Label>
                <Select 
                  value={formData.clinic_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, clinic_id: value }))}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="בחר מרפאה" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map(clinic => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* סוג החיסון */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-slate-700">
                  סוג החיסון * (ניתן לבחור כמה)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {vaccinationOptions.map(vaccination => (
                    <div key={vaccination} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-blue-50">
                      <Checkbox
                        checked={formData.vaccination_types.includes(vaccination)}
                        onCheckedChange={(checked) => handleVaccinationToggle(vaccination, checked)}
                      />
                      <label className="text-sm font-medium cursor-pointer flex-1">
                        {vaccination}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* פרטי חיית המחמד */}
              <div className="space-y-2">
                <Label className="text-lg font-semibold text-slate-700">
                  מה השם של החבר/ה הפרוותי/ת? *
                </Label>
                <Input
                  value={formData.pet_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, pet_name: e.target.value }))}
                  placeholder="שם חיית המחמד"
                  className="h-12 text-lg"
                />
              </div>

              {/* פרטי הבעלים */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-lg font-semibold text-slate-700">
                    שם מלא של הבעלים *
                  </Label>
                  <Input
                    value={formData.owner_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, owner_name: e.target.value }))}
                    placeholder="שם מלא"
                    className="h-12 text-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-lg font-semibold text-slate-700">
                    טלפון נייד *
                  </Label>
                  <Input
                    type="tel"
                    value={formData.owner_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, owner_phone: e.target.value }))}
                    placeholder="05X-XXXXXXX"
                    className="h-12 text-lg"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-lg font-semibold text-slate-700">
                  אימייל לקבלת אישור *
                </Label>
                <Input
                  type="email"
                  value={formData.owner_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, owner_email: e.target.value }))}
                  placeholder="example@email.com"
                  className="h-12 text-lg"
                  dir="ltr"
                />
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={() => onNext(formData)}
                  disabled={!canProceed}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white h-12 text-lg"
                >
                  להמשך לבחירת מועד <ArrowRight className="w-5 h-5 mr-2" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// מסך A2: בחירת מועד מדויק
const DateTimeSelection = ({ formData, onNext, onBack }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  
  // זמנים זמינים דמה - בעתיד יתחבר ל-Google Calendar
  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const today = new Date();
  const maxDate = addDays(today, 30); // אפשר לקבוע תור עד חודש קדימה

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto"
    >
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-green-100">
        <CardHeader className="border-b border-green-100">
          <CardTitle className="text-2xl font-bold text-green-800 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-blue-500" />
            בחירת מועד לחיסון
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          {/* בחירת תאריך */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-slate-700">
              בחירת תאריך
            </Label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => 
                  isBefore(date, today) || 
                  isAfter(date, maxDate) ||
                  date.getDay() === 5 || // יום שישי
                  date.getDay() === 6    // שבת
                }
                className="rounded-md border shadow"
                locale={he}
              />
            </div>
          </div>

          {/* בחירת שעה */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Label className="text-lg font-semibold text-slate-700">
                בחירת שעה
              </Label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {availableTimes.map(time => (
                  <Button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    variant={selectedTime === time ? 'default' : 'outline'}
                    className="h-12"
                  >
                    <Clock className="w-4 h-4 ml-2" />
                    {time}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {/* סיכום */}
          {selectedDate && selectedTime && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <h3 className="font-semibold text-blue-800 mb-2">התור שנבחר:</h3>
              <p className="text-blue-700">
                📅 {format(selectedDate, "EEEE, d MMMM yyyy", { locale: he })} בשעה {selectedTime}
              </p>
            </motion.div>
          )}

          {/* כפתורי ניווט */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex-1 h-12 text-lg"
            >
              <ArrowLeft className="w-5 h-5 ml-2" />
              חזרה
            </Button>
            <Button
              onClick={() => onNext({ selectedDate, selectedTime })}
              disabled={!selectedDate || !selectedTime}
              className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white h-12 text-lg"
            >
              קבעו את התור <CheckCircle className="w-5 h-5 mr-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// מסך A3: אישור סופי
const FinalConfirmation = ({ appointmentData, formData, dateTimeData }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const selectedClinic = appointmentData.clinics?.find(c => c.id === formData.clinic_id);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    
    try {
      const appointmentRequest = {
        clinic_id: formData.clinic_id,
        request_type: 'vaccination',
        customer_type: appointmentData.customer_type,
        owner_name: formData.owner_name,
        owner_phone: formData.owner_phone,
        owner_email: formData.owner_email,
        pet_name: formData.pet_name,
        pet_type: appointmentData.pet_type,
        vaccination_types: formData.vaccination_types,
        appointment_datetime: new Date(
          dateTimeData.selectedDate.getFullYear(),
          dateTimeData.selectedDate.getMonth(),
          dateTimeData.selectedDate.getDate(),
          parseInt(dateTimeData.selectedTime.split(':')[0]),
          parseInt(dateTimeData.selectedTime.split(':')[1])
        ).toISOString(),
        status: 'confirmed'
      };

      await createEntity(AppointmentRequest, appointmentRequest);
      
      // TODO: כאן נוסיף יצירת אירוע ב-Google Calendar
      
      setTimeout(() => {
        setIsComplete(true);
      }, 1500);
      
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('שגיאה ביצירת התור. אנא נסו שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto"
      >
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-green-200">
          <CardHeader className="text-center border-b border-green-200">
            <div className="mx-auto mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-800">
              מעולה, התור נקבע! 🎉
            </CardTitle>
            <p className="text-lg text-slate-600">
              שלחנו לכם אישור וזימון ליומן למייל שהזנתם.
            </p>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* סיכום התור */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-green-800 mb-4 text-xl">סיכום התור:</h3>
              <div className="space-y-2 text-green-700">
                <p><strong>שירות:</strong> {formData.vaccination_types.join(', ')}</p>
                <p><strong>לכבוד:</strong> {formData.pet_name}</p>
                <p><strong>מרפאה:</strong> {selectedClinic?.name}</p>
                <p><strong>מועד:</strong> {format(dateTimeData.selectedDate, "EEEE, d MMMM yyyy", { locale: he })} בשעה {dateTimeData.selectedTime}</p>
              </div>
            </div>

            {appointmentData.customer_type === 'new' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                <h4 className="font-bold text-purple-800 mb-2">
                  🎉 אנחנו כל כך שמחים שהצטרפתם למשפחת טדי וטס!
                </h4>
              </div>
            )}

            {/* הצעת ערך */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                טיפ מהצוות שלנו 💡
              </h4>
              <p className="text-blue-700">
                נצלו את ההגעה למרפאה כדי להתייעץ איתנו על תזונה נכונה או לשקול טיפול מונע נגד פרעושים וקרציות לקראת העונה.
              </p>
            </div>

            {/* הנעה לפעולה */}
            <div className="text-center space-y-4">
              <p className="text-slate-600">רוצים להישאר מעודכנים?</p>
              <Button
                onClick={() => window.open('https://facebook.com/teddyvets', '_blank')}
                variant="outline"
                className="mb-4"
              >
                עקבו אחרינו בפייסבוק לעוד טיפים וסיפורים מהמרפאה! 📘
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={() => navigate('/AppointmentBooking')}
                className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white h-12 text-lg"
              >
                חזרה למסך הראשי
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto"
    >
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-yellow-100">
        <CardHeader className="border-b border-yellow-100">
          <CardTitle className="text-2xl font-bold text-yellow-800 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            אישור התור
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8">
          {/* סיכום התור */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-yellow-800 mb-4">אנא אשרו את פרטי התור:</h3>
            <div className="space-y-2 text-yellow-700">
              <p><strong>שירות:</strong> {formData.vaccination_types.join(', ')}</p>
              <p><strong>לכבוד:</strong> {formData.pet_name}</p>
              <p><strong>בעלים:</strong> {formData.owner_name}</p>
              <p><strong>טלפון:</strong> {formData.owner_phone}</p>
              <p><strong>אימייל:</strong> {formData.owner_email}</p>
              <p><strong>מרפאה:</strong> {selectedClinic?.name}</p>
              <p><strong>מועד:</strong> {format(dateTimeData.selectedDate, "EEEE, d MMMM yyyy", { locale: he })} בשעה {dateTimeData.selectedTime}</p>
            </div>
          </div>

          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white h-12 text-lg"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                מקבע תור...
              </>
            ) : (
              <>
                אישור וקביעת התור <CheckCircle className="w-5 h-5 mr-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// הקומפוננטה הראשית לטופס חיסון
export default function VaccinationForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('details');
  const [clinics, setClinics] = useState([]);
  const [formData, setFormData] = useState({});
  const [dateTimeData, setDateTimeData] = useState({});
  
  const appointmentData = location.state?.appointmentData || {};

  useEffect(() => {
    const loadClinics = async () => {
      try {
        const clinicsData = await getEntityList(Clinic, { is_active: true });
        setClinics(clinicsData);
        setAppointmentData(prev => ({ ...prev, clinics: clinicsData }));
      } catch (error) {
        console.error('Error loading clinics:', error);
      }
    };
    loadClinics();
  }, []);

  const [appointmentDataState, setAppointmentData] = useState(appointmentData);

  const handleStepNavigation = (step, data = null) => {
    if (data) {
      if (step === 'datetime') {
        setFormData(data);
        setCurrentStep('datetime');
      } else if (step === 'confirmation') {
        setDateTimeData(data);
        setCurrentStep('confirmation');
      }
    } else {
      setCurrentStep(step);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'details':
        return (
          <VaccinationDetailsForm 
            appointmentData={appointmentDataState} 
            onNext={(data) => handleStepNavigation('datetime', data)} 
          />
        );
      case 'datetime':
        return (
          <DateTimeSelection 
            formData={formData}
            onNext={(data) => handleStepNavigation('confirmation', data)}
            onBack={() => setCurrentStep('details')}
          />
        );
      case 'confirmation':
        return (
          <FinalConfirmation 
            appointmentData={appointmentDataState}
            formData={formData}
            dateTimeData={dateTimeData}
          />
        );
      default:
        return <VaccinationDetailsForm appointmentData={appointmentDataState} onNext={(data) => handleStepNavigation('datetime', data)} />;
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/AppointmentBooking')}
            className="text-slate-600 hover:text-slate-800"
          >
            <ArrowLeft className="w-5 h-5 ml-2" />
            חזרה לבחירת שירות
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {renderCurrentStep()}
        </AnimatePresence>

        <WhatsAppButton />
      </div>
    </div>
  );
}