import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EmergencyTriage } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertCircle,
  ArrowRight,
  Phone,
  Mail,
  PawPrint,
  Calendar,
  Clock,
  User,
  FileText,
  Save,
  MapPin,
  Printer
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

import { getEntityById, updateEntity } from "@/components/utils/apiHelpers";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import PageHeader from "@/components/common/PageHeader";

export default function ViewEmergencyTriagePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const triageId = queryParams.get("id");

  const [triage, setTriage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [staffNotes, setStaffNotes] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (triageId) {
      loadTriage();
    }
  }, [triageId]);

  const loadTriage = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getEntityById(EmergencyTriage, triageId, 'EmergencyTriage');
      setTriage(data);
      setStaffNotes(data.staff_notes || "");
      setStatus(data.status || "submitted");
    } catch (err) {
      console.error("Error loading triage:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateEntity(EmergencyTriage, triageId, {
        staff_notes: staffNotes,
        status: status
      }, 'EmergencyTriage');
      
      alert("השינויים נשמרו בהצלחה");
      loadTriage();
    } catch (err) {
      console.error("Error saving:", err);
      alert("שגיאה בשמירת השינויים");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate(-1);
  };

  const severityConfig = {
    RED: {
      label: "חירום קריטי",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: AlertCircle
    },
    ORANGE: {
      label: "דחוף",
      color: "bg-orange-100 text-orange-800 border-orange-200",
      icon: AlertCircle
    },
    YELLOW: {
      label: "מעקב ביתי",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock
    },
    GREEN: {
      label: "רגיל",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: Clock
    }
  };

  const statusConfig = {
    draft: { label: "טיוטה", color: "bg-gray-100 text-gray-800" },
    submitted: { label: "הוגש", color: "bg-blue-100 text-blue-800" },
    contacted: { label: "נוצר קשר", color: "bg-purple-100 text-purple-800" },
    arrived: { label: "הגיע למרפאה", color: "bg-green-100 text-green-800" },
    cancelled: { label: "בוטל", color: "bg-red-100 text-red-800" }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "לא זמין";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "תאריך לא תקין";
      return format(date, "dd/MM/yyyy HH:mm", { locale: he });
    } catch {
      return "תאריך לא תקין";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <PageHeader title="טוען טופס טריאז' חירום..." />
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !triage) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <PageHeader
            title="צפייה בטופס טריאז' חירום"
            backButton
            onBack={handleBack}
          />
          <ErrorMessage error={error || "טופס לא נמצא"} onRetry={loadTriage} />
        </div>
      </div>
    );
  }

  const severityConf = severityConfig[triage.severity] || severityConfig.GREEN;
  const SeverityIcon = severityConf.icon;

  return (
    <>
      <style>{`
        @media print {
          /* הסתרת אלמנטים שאינם רלוונטיים להדפסה */
          .no-print, 
          button:not(.print-show),
          nav,
          aside,
          header > *:not(.print-show),
          .print-hide {
            display: none !important;
          }
          
          /* הסרת רקעים צבעוניים */
          body {
            background: white !important;
          }
          
          /* מקסום ניצול הדף */
          .max-w-5xl {
            max-width: 100% !important;
          }
          
          .p-6 {
            padding: 0.5rem !important;
          }
          
          /* הבטחה שכרטיסיות לא נשברות בין עמודים */
          .bg-white\\/80,
          .bg-white\\/90 {
            page-break-inside: avoid;
            background: white !important;
          }
          
          /* שיפור צבעי badges להדפסה */
          .bg-red-100 { background-color: #fee !important; }
          .bg-orange-100 { background-color: #ffe !important; }
          .bg-yellow-100 { background-color: #ffc !important; }
          .bg-green-100 { background-color: #efe !important; }
          .bg-blue-100 { background-color: #eef !important; }
          .bg-purple-100 { background-color: #fef !important; }
          
          /* שמירה על צבעי טקסט */
          .text-red-800 { color: #991b1b !important; }
          .text-orange-800 { color: #9a3412 !important; }
          .text-yellow-800 { color: #854d0e !important; }
          .text-green-800 { color: #166534 !important; }
          .text-blue-800 { color: #1e40af !important; }
          .text-purple-800 { color: #6b21a8 !important; }
          
          /* הסתרת צללים */
          .shadow-lg,
          .shadow-xl,
          .shadow-2xl {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
        }
      `}</style>
    
      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="no-print">
            <PageHeader
              title="צפייה בטופס טריאז' חירום"
              backButton
              onBack={handleBack}
            />
          </div>

          {/* כותרת להדפסה בלבד */}
          <div className="hidden print-show" style={{ display: 'none' }}>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">טופס טריאז' חירום - מרפאות טדי וטס</h1>
              <p className="text-sm text-slate-600">תאריך הדפסה: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: he })}</p>
            </div>
          </div>

          {/* כותרת ומצב */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {triage.pet_name} של {triage.owner_name}
              </h2>
              <p className="text-slate-600">
                נשלח ב-{formatDate(triage.created_date)}
              </p>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <Badge className={`${severityConf.color} border text-lg px-4 py-2`}>
                <SeverityIcon className="w-5 h-5 ml-2" />
                {severityConf.label}
              </Badge>
              <Badge className={`${statusConfig[triage.status]?.color} border text-lg px-4 py-2`}>
                {statusConfig[triage.status]?.label}
              </Badge>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="no-print border-slate-300 hover:bg-slate-50"
              >
                <Printer className="w-4 h-4 ml-2" />
                הדפסה
              </Button>
            </div>
          </div>

          {/* שאר התוכן ללא שינוי */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* פרטי בעלים */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  פרטי בעלים
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <a href={`tel:${triage.owner_phone}`} className="text-blue-600 hover:underline">
                    {triage.owner_phone}
                  </a>
                </div>
                {triage.owner_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <a href={`mailto:${triage.owner_email}`} className="text-blue-600 hover:underline text-xs">
                      {triage.owner_email}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* פרטי חיית המחמד */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-orange-500" />
                  פרטי חיית המחמד
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>סוג:</strong> {triage.pet_species}</div>
                {triage.pet_breed && <div><strong>גזע:</strong> {triage.pet_breed}</div>}
                {triage.pet_age_category && <div><strong>גיל:</strong> {triage.pet_age_category}</div>}
                {triage.pet_sex_neutered && <div><strong>מין:</strong> {triage.pet_sex_neutered}</div>}
                {triage.pet_weight_kg && <div><strong>משקל:</strong> {triage.pet_weight_kg} ק"ג</div>}
              </CardContent>
            </Card>

            {/* זמנים */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                  זמנים
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <div className="font-medium">נשלח</div>
                    <div className="text-slate-600">{formatDate(triage.created_date)}</div>
                  </div>
                </div>
                {triage.contacted_at && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="font-medium">נוצר קשר</div>
                      <div className="text-slate-600">{formatDate(triage.contacted_at)}</div>
                      {triage.contacted_by && (
                        <div className="text-xs text-slate-500">ע"י {triage.contacted_by}</div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* תסמינים */}
          <Card className="bg-white/80 backdrop-blur-sm mb-6">
            <CardHeader className="border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-500" />
                תסמינים ומצב
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* דגלים אדומים */}
              {triage.red_flags && Object.values(triage.red_flags).some(v => v) && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-bold text-red-800 mb-2">🚨 דגלים אדומים (חירום)</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                    {triage.red_flags.breathing && <li>קשיי נשימה</li>}
                    {triage.red_flags.bleeding && <li>דימום חמור</li>}
                    {triage.red_flags.bloat && <li>נפיחות בטן (GDV)</li>}
                    {triage.red_flags.toxin && <li>חשיפה לרעל</li>}
                    {triage.red_flags.seizure && <li>התקפים</li>}
                    {triage.red_flags.trauma && <li>טראומה/תאונה</li>}
                    {triage.red_flags.male_cat_urinary && <li>חתול זכר - בעיית השתנה</li>}
                    {triage.red_flags.dystocia && <li>קושי בלידה</li>}
                  </ul>
                </div>
              )}

              {/* דגלים כתומים */}
              {triage.orange_flags && Object.values(triage.orange_flags).some(v => v) && (
                <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-bold text-orange-800 mb-2">🟠 דגלים כתומים (דחוף)</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-orange-700">
                    {triage.orange_flags.vomit && <li>הקאות חוזרות</li>}
                    {triage.orange_flags.eye && <li>פגיעה בעין</li>}
                    {triage.orange_flags.skin_wound && <li>פצע עור</li>}
                  </ul>
                </div>
              )}

              {/* דגלים צהובים */}
              {triage.yellow_flags && Object.values(triage.yellow_flags).some(v => v) && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-bold text-yellow-800 mb-2">🟡 דגלים צהובים (מעקב ביתי)</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                    {triage.yellow_flags.mild && <li>תסמינים קלים</li>}
                  </ul>
                </div>
              )}

              {/* פרטים נוספים */}
              <div className="space-y-4 mt-4">
                {triage.symptoms_onset && (
                  <div>
                    <Label className="font-bold text-slate-700">מתי התחילו הסימנים:</Label>
                    <p className="text-slate-600 mt-1">{triage.symptoms_onset}</p>
                  </div>
                )}

                {triage.previous_conditions && (
                  <div>
                    <Label className="font-bold text-slate-700">מחלות רקע:</Label>
                    <p className="text-slate-600 mt-1">{triage.previous_conditions}</p>
                  </div>
                )}

                {triage.current_medications && (
                  <div>
                    <Label className="font-bold text-slate-700">תרופות נוכחיות:</Label>
                    <p className="text-slate-600 mt-1">{triage.current_medications}</p>
                  </div>
                )}

                {triage.exposure_details && (
                  <div>
                    <Label className="font-bold text-slate-700">חשיפות אפשריות:</Label>
                    <p className="text-slate-600 mt-1">{triage.exposure_details}</p>
                  </div>
                )}
              </div>

              {/* תמונות/סרטונים */}
              {triage.media_urls && triage.media_urls.length > 0 && (
                <div className="mt-6">
                  <Label className="font-bold text-slate-700 mb-3 block">תמונות וסרטונים שהועלו:</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {triage.media_urls.map((media, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        {media.type === 'image' ? (
                          <img src={media.url} alt={media.filename || `Media ${index}`} className="w-full h-40 object-cover" />
                        ) : (
                          <video src={media.url} controls className="w-full h-40 object-cover" />
                        )}
                        <div className="p-2 bg-slate-50 text-xs text-slate-600 truncate">
                          {media.filename}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* מיקום ומרפאה מומלצת */}
          {(triage.recommended_clinic_id || triage.user_location) && (
            <Card className="bg-white/80 backdrop-blur-sm mb-6">
              <CardHeader className="border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-green-500" />
                  מיקום ומרפאה מומלצת
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {triage.distance_to_clinic_km && (
                  <div className="text-slate-700">
                    <strong>מרחק למרפאה:</strong> {triage.distance_to_clinic_km.toFixed(1)} ק"מ
                  </div>
                )}
                {triage.eta_minutes && (
                  <div className="text-slate-700">
                    <strong>זמן נסיעה משוער:</strong> {triage.eta_minutes} דקות
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* הערות צוות - מוסתר בהדפסה אם ריק */}
          <Card className={`bg-white/80 backdrop-blur-sm ${!staffNotes && 'no-print'}`}>
            <CardHeader className="border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" />
                הערות צוות ומעקב
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="no-print">
                <Label htmlFor="status" className="font-bold mb-2 block">סטטוס הטיפול</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">טיוטה</SelectItem>
                    <SelectItem value="submitted">הוגש</SelectItem>
                    <SelectItem value="contacted">נוצר קשר</SelectItem>
                    <SelectItem value="arrived">הגיע למרפאה</SelectItem>
                    <SelectItem value="cancelled">בוטל</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="staffNotes" className="font-bold mb-2 block no-print">הערות פנימיות</Label>
                <div className="hidden print-show" style={{ display: 'none' }}>
                  <Label className="font-bold mb-2 block">הערות פנימיות:</Label>
                </div>
                <Textarea
                  id="staffNotes"
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  rows={4}
                  placeholder="הערות לצוות המרפאה..."
                  className="no-print"
                />
                {staffNotes && (
                  <div className="hidden print-show" style={{ display: 'none' }}>
                    <p className="text-slate-700 whitespace-pre-wrap">{staffNotes}</p>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 no-print"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="ml-2" />
                    שומר...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 ml-2" />
                    שמור שינויים
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}