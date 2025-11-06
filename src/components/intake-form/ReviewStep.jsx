import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User, PawPrint, Heart, Info } from 'lucide-react';

const ReviewSection = ({ title, icon: Icon, children }) => (
  <Card className="bg-white/70">
    <CardHeader className="pb-4 border-b border-slate-200">
      <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-500" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-4 text-sm text-slate-700 space-y-2">
      {children}
    </CardContent>
  </Card>
);

const ReviewItem = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between">
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
    </div>
  );
};

export default function ReviewStep({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">סיכום ואישור פרטים</h3>
        <p className="text-slate-600">אנא בדקו שהפרטים שהזנתם נכונים לפני השליחה</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReviewSection title="פרטים אישיים" icon={User}>
          <ReviewItem label="שם מלא" value={formData.ownerName} />
          <ReviewItem label="טלפון" value={formData.phone} />
          <ReviewItem label="אימייל" value={formData.email} />
          <ReviewItem label="כתובת" value={formData.address} />
        </ReviewSection>

        <ReviewSection title="פרטי חיית המחמד" icon={PawPrint}>
          <ReviewItem label="שם החיה" value={formData.petName} />
          <ReviewItem label="סוג" value={formData.petType} />
          <ReviewItem label="גזע" value={formData.petBreed} />
          <ReviewItem label="גיל" value={formData.petAge} />
          <ReviewItem label="מין" value={formData.petGender} />
          <ReviewItem label="מסורס/מעוקרת" value={formData.petNeutered} />
        </ReviewSection>
        
        <ReviewSection title="היסטוריה רפואית" icon={Heart}>
          <ReviewItem label="ביקור ראשון" value={formData.firstVisit === 'yes' ? 'כן' : 'לא'} />
          <ReviewItem label="בעיות ידועות" value={formData.knownMedicalIssues} />
          <ReviewItem label="תזונה" value={formData.dietFoodType} />
          <ReviewItem label="בעיות התנהגות" value={formData.behavioralIssues} />
          <ReviewItem label="רמת חרדה" value={formData.vetAnxietyLevel} />
        </ReviewSection>

        <ReviewSection title="מידע על הביקור" icon={Info}>
          <ReviewItem label="סיבת הביקור" value={formData.visitReasonMain} />
          <ReviewItem label="פירוט" value={formData.visitReasonDetails} />
          <ReviewItem label="נושאים נוספים" value={formData.otherTopics} />
        </ReviewSection>
      </div>

      <div className="pt-6 border-t border-slate-200">
        <div className="flex items-center space-x-2 bg-blue-50 p-4 rounded-lg" dir="rtl">
          <input
            type="checkbox"
            id="terms"
            checked={formData.client_consent || false}
            onChange={(e) => updateFormData('client_consent', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded ml-2"
          />
          <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            אני מאשר/ת שהפרטים שמילאתי נכונים, ומסכים/ה לתנאי השירות של המרפאה.
          </Label>
        </div>
      </div>
    </div>
  );
}