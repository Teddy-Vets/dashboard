import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, PawPrint, Stethoscope, Heart, FileText, Shield } from 'lucide-react';

// Helper to determine badge color for neutered status
const getStatusColor = (status) => {
  switch (status) {
    case 'מסורס':
    case 'מעוקרת':
      return 'bg-green-100 text-green-800';
    case 'לא':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper to determine badge color for anxiety level
const getAnxietyColor = (level) => {
  switch (level) {
    case '1':
    case '2':
      return 'bg-green-100 text-green-800';
    case '3':
      return 'bg-yellow-100 text-yellow-800';
    case '4':
    case '5':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const DetailItem = ({ label, value, children, isBadge, badgeClass }) => (
  <div className="py-3 px-4 sm:px-6 border-b border-gray-100 last:border-b-0">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
      <span className="text-sm font-medium text-gray-500">{label}:</span>
      <div className="text-right sm:max-w-[65%]">
        {children ? children : (
          isBadge ? (
            <Badge className={badgeClass}>{value || 'לא צוין'}</Badge>
          ) : (
            <span className="text-sm text-gray-900 break-words">{value || 'לא צוין'}</span>
          )
        )}
      </div>
    </div>
  </div>
);

export default function ViewSubmittedIntakeForm({ formData }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* פרטים אישיים */}
      <Card className="bg-white/90 backdrop-blur-sm border-blue-100 shadow-lg">
        <CardHeader className="border-b border-blue-100">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-500" />
            פרטים אישיים
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            <DetailItem label="שם מלא" value={formData.owner_name} />
            {formData.owner_id_number && (
              <DetailItem label="תעודת זהות" value={formData.owner_id_number} />
            )}
            <DetailItem label="טלפון" value={formData.owner_phone} />
            <DetailItem label="אימייל" value={formData.owner_email} />
            <DetailItem label="כתובת" value={formData.address} />
            <DetailItem
              label="חיית מחמד ראשונה במשפחה"
              value={formData.first_ever_pet === 'yes' ? 'כן' : formData.first_ever_pet === 'no' ? 'לא' : undefined}
              isBadge
              badgeClass={formData.first_ever_pet === 'yes' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}
            />
            {formData.first_ever_pet === 'yes' && formData.first_pet_story && (
              <DetailItem label="מי מטפל ודואג" value={formData.first_pet_story} />
            )}
            {formData.first_ever_pet === 'no' && formData.not_first_pet_info && (
              <DetailItem label="מי דואג לחבר הפרוותי" value={formData.not_first_pet_info} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* פרטי חיית המחמד */}
      <Card className="bg-white/90 backdrop-blur-sm border-green-100 shadow-lg">
        <CardHeader className="border-b border-green-100">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <PawPrint className="w-6 h-6 text-green-500" />
            פרטי חיית המחמד
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            <DetailItem label="שם" value={formData.pet_name} />
            <DetailItem label="סוג" value={formData.pet_type} />
            <DetailItem label="גזע" value={formData.pet_breed} />
            <DetailItem label="גיל" value={formData.pet_age} />
            <DetailItem label="מין" value={formData.pet_gender} />
            <DetailItem
              label="מסורס/מעוקרת"
              value={formData.pet_neutered}
              isBadge
              badgeClass={getStatusColor(formData.pet_neutered)}
            />
            <DetailItem label="מספר שבב" value={formData.pet_microchip} />
            
            {formData.previous_treatments_file_url && (
              <DetailItem label="סיכום טיפולים קודמים">
                <a
                  href={formData.previous_treatments_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <FileText className="w-4 h-4" />
                  צפייה בקובץ
                </a>
              </DetailItem>
            )}

            {formData.vaccine_book_url && (
              <DetailItem label="פנקס חיסונים">
                <a
                  href={formData.vaccine_book_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-600 hover:text-green-800"
                >
                  <FileText className="w-4 h-4" />
                  צפייה בפנקס חיסונים
                </a>
              </DetailItem>
            )}

            {formData.pet_picture_url && (
              <DetailItem label="תמונה">
                <img
                  src={formData.pet_picture_url}
                  alt="תמונת חיית המחמד"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </DetailItem>
            )}
          </div>
        </CardContent>
      </Card>

      {/* היסטוריה רפואית */}
      <Card className="bg-white/90 backdrop-blur-sm border-purple-100 shadow-lg">
        <CardHeader className="border-b border-purple-100">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-500" />
            היסטוריה רפואית והתנהגות
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            <DetailItem
              label="ביקור ראשון במרפאה"
              value={formData.first_visit === 'yes' ? 'כן' : 'לא'}
              isBadge
              badgeClass={formData.first_visit === 'yes' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
            />
            
            {formData.how_heard_about_us && (
              <DetailItem label="איך שמע על המרפאה" value={formData.how_heard_about_us} />
            )}

            {formData.first_visit === 'no' && (
              <>
                {formData.previous_clinic_name && (
                  <DetailItem label="מרפאה קודמת" value={formData.previous_clinic_name} />
                )}
                {formData.why_left_previous_clinic && (
                  <DetailItem label="סיבת עזיבת המרפאה הקודמת" value={formData.why_left_previous_clinic} />
                )}
                {formData.prev_vet_likes && (
                  <DetailItem label="מה אהב במרפאה הקודמת" value={formData.prev_vet_likes} />
                )}
                {formData.needs_from_us && (
                  <DetailItem label="מה חשוב שיהיה במרפאה שלנו" value={formData.needs_from_us} />
                )}
              </>
            )}

            <DetailItem label="בעיות רפואיות/התנהגותיות ידועות" value={formData.known_medical_issues} />
            <DetailItem label="סוג מזון" value={formData.diet_food_type} />
            <DetailItem
              label="רמת חרדה במרפאה"
              value={formData.vet_anxiety_level ? `${formData.vet_anxiety_level}/10` : undefined}
              isBadge
              badgeClass={getAnxietyColor(formData.vet_anxiety_level)}
            />
            {formData.vet_anxiety_level >= 5 && formData.anxiety_help_suggestions && (
              <DetailItem label="הצעות להקלת סטרס" value={formData.anxiety_help_suggestions} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visit Info */}
      <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
        <CardHeader className="border-b border-blue-100">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Heart className="w-6 h-6 text-purple-500" /> 
            פרטי הביקור
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            <DetailItem label="סיבת הביקור העיקרית" value={formData.visit_reason_main} />
            <DetailItem label="פירוט נוסף על סיבת הביקור" value={formData.visit_reason_details} />
            
            {/* ביטוח */}
            <DetailItem
              label="יש ביטוח"
              value={formData.has_insurance === 'yes' ? 'כן' : formData.has_insurance === 'no' ? 'לא' : undefined}
              isBadge
              badgeClass={formData.has_insurance === 'yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
            />
            {formData.has_insurance === 'yes' && formData.insurance_company && (
              <DetailItem label="חברת ביטוח" value={formData.insurance_company} />
            )}
            
            <DetailItem label="נושאים נוספים לדיון" value={formData.other_topics} />
          </div>
        </CardContent>
      </Card>

    </div>
  );
}