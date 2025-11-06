
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Heart,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  Navigation,
  Upload, // New import
  X // New import
} from "lucide-react";

// Simple LoadingSpinner component (since it was referenced in the outline but not imported)
const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }[size];

  return (
    <svg
      className={`animate-spin ${sizeClass} text-current ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};


const evaluateSeverity = (answers) => {
  if (answers.breathing || answers.bleeding || answers.bloat || 
      answers.toxin || answers.seizure || answers.trauma || 
      answers.maleCatUrinary || answers.dystocia) {
    return "RED";
  }
  if (answers.vomit || answers.eye || answers.skinWound) {
    return "ORANGE";
  }
  if (answers.mild) {
    return "YELLOW";
  }
  return "GREEN";
};

const SEVERITY_MESSAGES = {
  RED: {
    title: "נראה שזה דורש תשומת לב מיידית",
    body: "אנחנו כאן בשבילכם. מומלץ לנסוע כעת למרפאה הקרובה או ליצור קשר דרך הכפתורים למטה.",
    color: "bg-rose-50 border-rose-200 text-rose-800",
    icon: "💝"
  },
  ORANGE: {
    title: "כדאי שנבדוק את זה היום",
    body: "התסמינים שתיארתם מצריכים בדיקה בהקדם. אנחנו נדאג לכם.",
    color: "bg-blue-50 border-blue-200 text-blue-800",
    icon: "💙"
  },
  YELLOW: {
    title: "נראה שאפשר להתחיל בטיפול ביתי",
    body: "המצב נראה יציב. התחילו בטיפול ביתי ועקבו מקרוב. אם יש החמרה - פנו אלינו.",
    color: "bg-teal-50 border-teal-200 text-teal-800",
    icon: "💚"
  },
  GREEN: {
    title: "נשמח לראות אתכם בתור רגיל",
    body: "לא נראה משהו דחוף במיוחד. נקבע תור לבדיקה מסודרת בזמן הנוח לכם.",
    color: "bg-emerald-50 border-emerald-200 text-emerald-800",
    icon: "✨"
  }
};

// Floating Buttons Component
function FloatingButtons({ clinics, petName, ownerName }) {
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  
  const handleWhatsAppClick = () => {
    const firstClinic = clinics?.[0];
    const whatsappNumber = firstClinic?.whatsapp_number || "972501234567";
    const message = `שלום, אני ${ownerName || "בעל/ת חיית מחמד"} ואני זקוק/ה לעזרה חירום עבור ${petName || "חיית המחמד שלי"}. מלאתי את טופס הטריאז' באתר.`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const allEmergencyClinics = [
    ...(clinics || []).map(c => ({
      name: c.name,
      address: c.address,
      phone: c.phone,
      isOurs: true,
      lat: c.lat,
      lng: c.lng
    })),
    ...(clinics?.[0]?.emergency_clinics_list || []).map(c => ({
      ...c,
      isOurs: false
    }))
  ];

  return (
    <>
      <div className="fixed bottom-6 left-6 flex flex-col gap-3 z-50" dir="ltr">
        <Button
          onClick={handleWhatsAppClick}
          className="bg-green-500 hover:bg-green-600 text-white shadow-2xl rounded-full w-14 h-14 flex items-center justify-center transition-all hover:scale-110"
          title="שלח וואטסאפ למרפאה"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
        
        <Button
          onClick={() => setShowEmergencyDialog(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white shadow-2xl rounded-full w-14 h-14 flex items-center justify-center transition-all hover:scale-110"
          title="מרפאות חירום קרובות"
        >
          <MapPin className="w-6 h-6" />
        </Button>
      </div>

      <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-right">🏥 מרפאות חירום קרובות</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {allEmergencyClinics.length === 0 ? (
              <p className="text-center text-slate-600">לא נמצאו מרפאות חירום</p>
            ) : (
              allEmergencyClinics.map((clinic, index) => (
                <Card key={index} className={`${clinic.isOurs ? 'border-blue-300 bg-blue-50' : 'border-slate-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">{clinic.name}</h3>
                        {clinic.isOurs && (
                          <Badge className="bg-blue-500 text-white mt-1">מרפאת הרשת שלנו</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                        <span className="text-slate-700">{clinic.address}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-500" />
                        <a href={`tel:${clinic.phone}`} className="text-blue-600 hover:underline font-medium">
                          {clinic.phone}
                        </a>
                      </div>
                      
                      {clinic.notes && (
                        <p className="text-slate-600 text-xs mt-2">{clinic.notes}</p>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      {clinic.lat && clinic.lng && (
                        <Button
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`, '_blank')}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Navigation className="w-4 h-4 ml-1" />
                          נווט
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function EmergencyTriageFlow({ onSuccess }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [severity, setSeverity] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]); // New state
  const [isUploading, setIsUploading] = useState(false); // New state
  
  const [formData, setFormData] = useState({
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    petName: "",
    petSpecies: "",
    petBreed: "",
    petAge: "",
    petSex: "",
    petWeight: "",
    breathing: false,
    bleeding: false,
    bloat: false,
    toxin: false,
    seizure: false,
    trauma: false,
    maleCatUrinary: false,
    dystocia: false,
    vomit: false,
    eye: false,
    skinWound: false,
    mild: false,
    symptomsOnset: "",
    previousConditions: "",
    currentMedications: "",
    exposureDetails: ""
  });

  useEffect(() => {
    const loadClinics = async () => {
      try {
        const { Clinic } = await import("@/entities/all");
        const allClinics = await Clinic.filter({ is_active: true });
        setClinics(allClinics);
      } catch (error) {
        console.error("Error loading clinics:", error);
      }
    };
    loadClinics();
  }, []);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // New function for file upload
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    
    try {
      const { UploadFile } = await import("@/integrations/Core");
      
      const uploadPromises = files.map(async (file) => {
        const fileType = file.type.startsWith('image/') ? 'image' : 'video';
        const result = await UploadFile({ file });
        
        return {
          url: result.file_url,
          type: fileType,
          filename: file.name
        };
      });
      
      const results = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...results]);
      
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("שגיאה בהעלאת הקבצים. אנא נסו שוב.");
    } finally {
      setIsUploading(false);
      // Clear the input to allow uploading the same file again if needed
      event.target.value = null; 
    }
  };

  // New function to remove uploaded files
  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 2) {
      const calculatedSeverity = evaluateSeverity(formData);
      setSeverity(calculatedSeverity);
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const { EmergencyTriage } = await import("@/entities/all");
      
      const triageData = {
        owner_name: formData.ownerName,
        owner_phone: formData.ownerPhone,
        owner_email: formData.ownerEmail || null,
        pet_name: formData.petName,
        pet_species: formData.petSpecies,
        pet_breed: formData.petBreed || null,
        pet_age_category: formData.petAge || null,
        pet_sex_neutered: formData.petSex || null,
        pet_weight_kg: formData.petWeight ? parseFloat(formData.petWeight) : null,
        severity: severity,
        red_flags: {
          breathing: formData.breathing,
          bleeding: formData.bleeding,
          bloat: formData.bloat,
          toxin: formData.toxin,
          seizure: formData.seizure,
          trauma: formData.trauma,
          male_cat_urinary: formData.maleCatUrinary,
          dystocia: formData.dystocia
        },
        orange_flags: {
          vomit: formData.vomit,
          eye: formData.eye,
          skin_wound: formData.skinWound
        },
        yellow_flags: {
          mild: formData.mild
        },
        symptoms_onset: formData.symptomsOnset || null,
        previous_conditions: formData.previousConditions || null,
        current_medications: formData.currentMedications || null,
        exposure_details: formData.exposureDetails || null,
        media_urls: uploadedFiles, // New field
        status: "submitted"
      };
      
      await EmergencyTriage.create(triageData);
      
      if (onSuccess) {
        onSuccess();
      }
      
      setStep(5);
      
    } catch (error) {
      console.error("Error submitting triage:", error);
      alert("אירעה שגיאה בשליחת הטופס. אנא השתמשו בכפתורי החירום למטה או התקשרו ישירות למרפאה.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Floating Buttons - always visible
  const floatingButtons = (
    <FloatingButtons 
      clinics={clinics} 
      petName={formData.petName}
      ownerName={formData.ownerName}
    />
  );

  if (step === 1) {
    return (
      <>
        {floatingButtons}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-blue-100">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 via-teal-50 to-cyan-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-2xl">
                1
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-800">פרטים בסיסיים</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  💙 אנחנו כאן בשבילכם
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <Heart className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>רגע של שקט:</strong> אנחנו מבינים שאתם דואגים. כל פרט שתספקו יעזור לנו לתת את העזרה הטובה ביותר.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ownerName">שם הבעלים *</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => updateField('ownerName', e.target.value)}
                  placeholder="שם מלא"
                  className="mt-2 border-blue-200 focus:border-blue-400"
                />
              </div>
              
              <div>
                <Label htmlFor="ownerPhone">טלפון *</Label>
                <Input
                  id="ownerPhone"
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={(e) => updateField('ownerPhone', e.target.value)}
                  placeholder="05X-XXXXXXX"
                  className="mt-2 border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ownerEmail">אימייל (אופציונלי)</Label>
              <Input
                id="ownerEmail"
                type="email"
                value={formData.ownerEmail}
                onChange={(e) => updateField('ownerEmail', e.target.value)}
                placeholder="example@email.com"
                className="mt-2 border-blue-200 focus:border-blue-400"
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">פרטי חיית המחמד</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="petName">שם החיה *</Label>
                  <Input
                    id="petName"
                    value={formData.petName}
                    onChange={(e) => updateField('petName', e.target.value)}
                    placeholder="שם החיה"
                    className="mt-2 border-blue-200 focus:border-blue-400"
                  />
                </div>
                
                <div>
                  <Label htmlFor="petSpecies">סוג החיה *</Label>
                  <Select 
                    value={formData.petSpecies} 
                    onValueChange={(value) => updateField('petSpecies', value)}
                  >
                    <SelectTrigger className="mt-2 border-blue-200">
                      <SelectValue placeholder="בחרו סוג חיה" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="כלב">כלב</SelectItem>
                      <SelectItem value="חתול">חתול</SelectItem>
                      <SelectItem value="אחר">אחר</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label htmlFor="petBreed">גזע</Label>
                  <Input
                    id="petBreed"
                    value={formData.petBreed}
                    onChange={(e) => updateField('petBreed', e.target.value)}
                    placeholder="גזע החיה"
                    className="mt-2 border-blue-200 focus:border-blue-400"
                  />
                </div>
                
                <div>
                  <Label htmlFor="petAge">גיל</Label>
                  <Select 
                    value={formData.petAge} 
                    onValueChange={(value) => updateField('petAge', value)}
                  >
                    <SelectTrigger className="mt-2 border-blue-200">
                      <SelectValue placeholder="בחרו גיל" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="גור (<12 חודשים)">גור (פחות מ-12 חודשים)</SelectItem>
                      <SelectItem value="בוגר">בוגר</SelectItem>
                      <SelectItem value="קשיש">קשיש</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="petWeight">משקל (ק"ג)</Label>
                  <Input
                    id="petWeight"
                    type="number"
                    value={formData.petWeight}
                    onChange={(e) => updateField('petWeight', e.target.value)}
                    placeholder="משקל"
                    className="mt-2 border-blue-200 focus:border-blue-400"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="petSex">מין</Label>
                  <Select 
                    value={formData.petSex} 
                    onValueChange={(value) => updateField('petSex', value)}
                  >
                    <SelectTrigger className="mt-2 border-blue-200">
                      <SelectValue placeholder="בחרו מין" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Shortened values for pet sex */}
                      <SelectItem value="זכר (לא מסורס)">זכר (לא מסורס)</SelectItem>
                      <SelectItem value="זכר (מסורס)">זכר (מסורס)</SelectItem>
                      <SelectItem value="נקבה (לא מעוקרת)">נקבה (לא מעוקרת)</SelectItem>
                      <SelectItem value="נקבה (מעוקרת)">נקבה (מעוקרת)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* New File Upload Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">העלאת תמונות/סרטונים (אופציונלי)</h3>
              <p className="text-sm text-slate-600 mb-4">
                העלו תמונות או סרטונים שיעזרו לווטרינר להבין את המצב טוב יותר
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('fileInput').click()}
                    disabled={isUploading}
                    className="border-blue-300 hover:bg-blue-50"
                  >
                    {isUploading ? (
                      <>
                        <LoadingSpinner size="sm" className="ml-2" />
                        מעלה...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 ml-2" />
                        בחר קבצים
                      </>
                    )}
                  </Button>
                  <span className="text-sm text-slate-500">
                    תמונות (JPG, PNG) או סרטונים (MP4, MOV)
                  </span>
                </div>
                
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {uploadedFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        {file.type === 'image' ? (
                          <img
                            src={file.url}
                            alt={file.filename}
                            className="w-full h-32 object-cover rounded-lg border-2 border-blue-200"
                          />
                        ) : (
                          // Placeholder for video files
                          <div className="w-full h-32 bg-slate-100 rounded-lg border-2 border-blue-200 flex items-center justify-center relative overflow-hidden">
                            <video 
                                src={file.url} 
                                className="absolute inset-0 w-full h-full object-cover" 
                                preload="metadata" // Load metadata to show first frame if possible
                                muted // Mute to avoid autoplay issues
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Upload className="w-8 h-8 text-white" /> {/* Use Upload icon to symbolize video */}
                            </div>
                            <p className="absolute bottom-2 text-xs text-white text-shadow-sm truncate w-full px-2 text-center">{file.filename}</p>
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleNext}
                disabled={!formData.ownerName || !formData.ownerPhone || !formData.petName || !formData.petSpecies}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-8"
              >
                המשך
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (step === 2) {
    return (
      <>
        {floatingButtons}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-blue-100">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 via-teal-50 to-cyan-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-2xl">
                2
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-800">סימנים ותסמינים</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  💚 תודה על שיתוף הפעולה. עוד קצת ונוכל לעזור
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Alert className="bg-teal-50 border-teal-200">
              <Heart className="w-4 h-4 text-teal-600" />
              <AlertDescription className="text-teal-800">
                <strong>אתם עושים נהדר:</strong> כל תסמין שתסמנו יעזור לנו להעריך את המצב בצורה מדויקת.
              </AlertDescription>
            </Alert>

            <div className="bg-rose-50 border-2 border-rose-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-rose-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🩺</span>
                סימני חירום - דורש תשומת לב מיידית
              </h3>
              
              <div className="space-y-3">
                {[
                  { id: 'breathing', label: 'קושי בנשימה / נשימות מהירות או רדודות' },
                  { id: 'bleeding', label: 'דימום שלא נעצר' },
                  { id: 'bloat', label: 'בטן מנופחת + אי שקט / ניסיונות להקיא' },
                  { id: 'toxin', label: 'חשיפה לרעל או חומר רעיל' },
                  { id: 'seizure', label: 'התקף אפילפטי' },
                  { id: 'trauma', label: 'תאונה / פגיעה חזקה' },
                  { id: 'maleCatUrinary', label: 'חתול זכר שלא משתין' },
                  { id: 'dystocia', label: 'לידה בעייתית' }
                ].map(flag => (
                  <div key={flag.id} className="flex items-start space-x-2 space-x-reverse bg-white p-3 rounded-lg">
                    <Checkbox
                      id={flag.id}
                      checked={formData[flag.id]}
                      onCheckedChange={(checked) => updateField(flag.id, checked)}
                      className="mt-1"
                    />
                    <Label htmlFor={flag.id} className="cursor-pointer font-medium text-slate-700 leading-relaxed">
                      {flag.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🔵</span>
                דחוף - מומלץ להגיע היום
              </h3>
              
              <div className="space-y-3">
                {[
                  { id: 'vomit', label: 'הקאות חוזרות / שלשול חמור' },
                  { id: 'eye', label: 'פגיעה בעין' },
                  { id: 'skinWound', label: 'פצע פתוח / שריטה עמוקה' }
                ].map(flag => (
                  <div key={flag.id} className="flex items-start space-x-2 space-x-reverse bg-white p-3 rounded-lg">
                    <Checkbox
                      id={flag.id}
                      checked={formData[flag.id]}
                      onCheckedChange={(checked) => updateField(flag.id, checked)}
                      className="mt-1"
                    />
                    <Label htmlFor={flag.id} className="cursor-pointer font-medium text-slate-700 leading-relaxed">
                      {flag.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-teal-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💚</span>
                מעקב ביתי
              </h3>
              
              <div className="flex items-start space-x-2 space-x-reverse bg-white p-3 rounded-lg">
                <Checkbox
                  id="mild"
                  checked={formData.mild}
                  onCheckedChange={(checked) => updateField('mild', checked)}
                  className="mt-1"
                />
                <Label htmlFor="mild" className="cursor-pointer font-medium text-slate-700 leading-relaxed">
                  תסמינים קלים / חולשה כללית
                </Label>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button onClick={handleBack} variant="outline" className="border-blue-300">
                <ArrowRight className="w-4 h-4 ml-2" />
                חזרה
              </Button>
              
              <Button 
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-8"
              >
                המשך
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (step === 3) {
    return (
      <>
        {floatingButtons}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-blue-100">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 via-teal-50 to-cyan-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-2xl">
                3
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-800">פרטים נוספים</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  ✨ כמעט סיימנו! המידע הזה יעזור לנו להבין טוב יותר
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Alert className="bg-cyan-50 border-cyan-200">
              <Heart className="w-4 h-4 text-cyan-600" />
              <AlertDescription className="text-cyan-800">
                <strong>כל פרט עוזר:</strong> אפילו פרטים קטנים יכולים להיות חשובים לאבחון נכון.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="symptomsOnset">מתי התחילו הסימנים?</Label>
              <Input
                id="symptomsOnset"
                value={formData.symptomsOnset}
                onChange={(e) => updateField('symptomsOnset', e.target.value)}
                placeholder="לדוגמה: לפני שעתיים, הבוקר, אתמול..."
                className="mt-2 border-blue-200 focus:border-blue-400"
              />
            </div>

            <div>
              <Label htmlFor="previousConditions">מחלות רקע ידועות</Label>
              <Textarea
                id="previousConditions"
                value={formData.previousConditions}
                onChange={(e) => updateField('previousConditions', e.target.value)}
                placeholder="סוכרת, בעיות לב, מחלות כרוניות..."
                className="mt-2 border-blue-200 focus:border-blue-400"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="currentMedications">תרופות קבועות</Label>
              <Textarea
                id="currentMedications"
                value={formData.currentMedications}
                onChange={(e) => updateField('currentMedications', e.target.value)}
                placeholder="רשמו את כל התרופות שהחיה לוקחת..."
                className="mt-2 border-blue-200 focus:border-blue-400"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="exposureDetails">חשיפה אפשרית לרעלים / מזון לא רגיל</Label>
              <Textarea
                id="exposureDetails"
                value={formData.exposureDetails}
                onChange={(e) => updateField('exposureDetails', e.target.value)}
                placeholder="מה אכלה? לאיזה חומרים נחשפה? צמחים? תרופות?"
                className="mt-2 border-blue-200 focus:border-blue-400"
                rows={3}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button onClick={handleBack} variant="outline" className="border-blue-300">
                <ArrowRight className="w-4 h-4 ml-2" />
                חזרה
              </Button>
              
              <Button 
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-8"
              >
                המשך להערכה
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (step === 4) {
    const message = SEVERITY_MESSAGES[severity];
    
    return (
      <>
        {floatingButtons}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-blue-100">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 via-teal-50 to-cyan-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-2xl">
                4
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-800">הערכת מצב</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  {message.icon} על סמך המידע שסיפקתם
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Alert className={message.color}>
              <AlertDescription>
                <h3 className="text-xl font-bold mb-3">{message.title}</h3>
                <p className="text-base leading-relaxed">{message.body}</p>
              </AlertDescription>
            </Alert>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-bold text-blue-900 mb-4 text-lg">💡 אנחנו כאן בשבילכם:</h4>
              <ul className="list-disc list-inside text-blue-800 space-y-2">
                <li>שימו לב לכפתורים הירוקים והכחולים בפינה השמאלית למטה</li>
                <li>תוכלו לשלוח לנו הודעה בוואטסאפ או לראות מרפאות קרובות</li>
                <li>המידע שלכם נשמר אצלנו ונציג יצור עמכם קשר</li>
                <li>אתם לא לבד - אנחנו פה!</li>
              </ul>
            </div>

            <div className="border-t pt-6">
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-6 text-lg"
              >
                {isSubmitting ? "שולח את הפרטים..." : "שלחו את הפרטים למרפאה"}
              </Button>
            </div>

            <div className="flex justify-start">
              <Button onClick={handleBack} variant="ghost" size="sm" className="text-slate-500">
                <ArrowRight className="w-4 h-4 ml-2" />
                חזרה לעריכה
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (step === 5) {
    return (
      <>
        {floatingButtons}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-blue-100">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-teal-400 rounded-full mx-auto mb-6 flex items-center justify-center">
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              הטופס נשלח בהצלחה! 🎉
            </h2>
            
            <div className="max-w-2xl mx-auto space-y-4 text-lg text-slate-700">
              <p className="leading-relaxed">
                תודה רבה על שיתוף הפעולה, <strong>{formData.ownerName}</strong>.
              </p>
              <p className="leading-relaxed">
                קיבלנו את המידע על <strong>{formData.petName}</strong> והצוות שלנו יצור עמכם קשר בהקדם האפשרי.
              </p>
              
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mt-6">
                <p className="font-semibold text-teal-900 mb-3">💚 בינתיים:</p>
                <ul className="text-right space-y-2 text-teal-800">
                  <li>✓ שמרו על הטלפון פתוח לשיחה מהמרפאה</li>
                  <li>✓ השתמשו בכפתורים הצפים למטה לצורך יצירת קשר מיידי</li>
                  <li>✓ שמרו על מנוחה וביטחון - אנחנו דואגים לכם</li>
                </ul>
              </div>
              
              <p className="text-slate-600 text-base mt-8">
                אם המצב מחמיר - אל תחכו, השתמשו בכפתור הוואטסאפ או התקשרו ישירות.
              </p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return null;
}
