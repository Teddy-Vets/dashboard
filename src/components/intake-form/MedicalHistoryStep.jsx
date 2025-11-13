
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { AlertCircle } from 'lucide-react';

export default function MedicalHistoryStep({ formData, updateFormData }) {
  return (
    <div className="space-y-8">
      {/* ביקור ראשון */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-700 flex items-center gap-2">
          <span className="text-red-500">*</span>
          האם זו הפעם הראשונה שלכם אצל וטרינר?
        </Label>
        <RadioGroup 
          value={formData.firstVisit} 
          onValueChange={(value) => updateFormData('firstVisit', value)}
          className="space-y-2"
        >
          <div className="flex items-center justify-end space-x-2 space-x-reverse">
            <Label htmlFor="first-visit-yes" className="cursor-pointer font-normal">כן, זו הפעם הראשונה</Label>
            <RadioGroupItem value="yes" id="first-visit-yes" />
          </div>
          <div className="flex items-center justify-end space-x-2 space-x-reverse">
            <Label htmlFor="first-visit-no" className="cursor-pointer font-normal">לא, עוברים ממרפאה אחרת</Label>
            <RadioGroupItem value="no" id="first-visit-no" />
          </div>
        </RadioGroup>
      </div>

      {/* שאלות מותנות לפי תשובה */}
      {formData.firstVisit === 'yes' && (
        <div className="space-y-3 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100 shadow-sm">
          <Label className="text-base font-medium text-slate-800">
            איך שמעתם על המרפאה?
          </Label>
          <Input
            value={formData.howHeardAboutUs}
            onChange={(e) => updateFormData('howHeardAboutUs', e.target.value)}
            placeholder="לדוגמה: המליצו לנו חברים, מודעה, חיפוש באינטרנט..."
            className="bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400"
          />
        </div>
      )}

      {formData.firstVisit === 'no' && (
        <div className="space-y-6 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
          <div className="space-y-3">
            <Label className="text-base font-medium text-slate-800">
              שם המרפאה/הווטרינר הקודם
            </Label>
            <Input
              value={formData.previousClinicName}
              onChange={(e) => updateFormData('previousClinicName', e.target.value)}
              placeholder="שם המרפאה או הווטרינר"
              className="bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-400"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium text-slate-800">
              מה אהבתם בווטרינר הקודם?
            </Label>
            <Textarea
              value={formData.prevVetLikes}
              onChange={(e) => updateFormData('prevVetLikes', e.target.value)}
              placeholder="מה היה טוב? זה יעזור לנו להבין מה חשוב לכם"
              className="bg-white h-24 border-slate-200 focus:border-indigo-400 focus:ring-indigo-400"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium text-slate-800">
              מה חשוב לכם שיהיה במרפאה שלנו?
            </Label>
            <Textarea
              value={formData.needsFromUs}
              onChange={(e) => updateFormData('needsFromUs', e.target.value)}
              placeholder="נשמח לדעת על מה חשוב לכם במיוחד..."
              className="bg-white h-24 border-slate-200 focus:border-indigo-400 focus:ring-indigo-400"
            />
          </div>
        </div>
      )}

      {/* בעיות רפואיות ידועות */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-800">
          בעיות רפואיות ידועות
        </Label>
        <p className="text-sm text-slate-500">
          לדוגמה: אלרגיות, מחלות כרוניות, מצבים רפואיים מיוחדים
        </p>
        <Textarea
          value={formData.knownMedicalIssues}
          onChange={(e) => updateFormData('knownMedicalIssues', e.target.value)}
          placeholder="אנא פרטו על בעיות רפואיות ידועות..."
          className="h-24 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
        />
      </div>

      {/* סוג מזון */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-800">
          סוג המזון
        </Label>
        <p className="text-sm text-slate-500">
          לדוגמה: יבש/רטוב, מותג, תדירות, מנות מיוחדות
        </p>
        <Textarea
          value={formData.dietFoodType}
          onChange={(e) => updateFormData('dietFoodType', e.target.value)}
          placeholder="פרטו על סוג המזון, מותג, כמות וכו'..."
          className="h-24 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
        />
      </div>

      {/* בעיות התנהגותיות */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-800">
          בעיות התנהגותיות
        </Label>
        <p className="text-sm text-slate-500">
          לדוגמה: נביחות, מרכיב שיניים, מפחד משינויים, מסוגל שווייתי, מסוגה מיוחדת
        </p>
        <Textarea
          value={formData.behavioralIssues}
          onChange={(e) => updateFormData('behavioralIssues', e.target.value)}
          placeholder="אנא תארו בעיות התנהגותיות..."
          className="h-24 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
        />
      </div>

      {/* רמת חרדה אצל הווטרינר */}
      <div className="space-y-4 bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <Label className="text-base font-medium text-slate-800">
            רמת חרדה אצל הווטרינר
          </Label>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          רמת חרדה (1 = רגוע מאוד, 10 = מלווה מאוד)
        </p>
        
        <div className="bg-white p-5 rounded-lg border border-amber-100 shadow-sm">
          <Slider
            value={[formData.vetAnxietyLevel]}
            onValueChange={(value) => updateFormData('vetAnxietyLevel', value[0])}
            min={1}
            max={10}
            step={1}
            className="mb-4"
            dir="ltr"
          />
          
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-rose-600">בחרדה גבוהה (10)</span>
            <span className="text-2xl font-bold text-amber-600">{formData.vetAnxietyLevel}</span>
            <span className="text-emerald-600">רגוע (1)</span>
          </div>
        </div>

        {formData.vetAnxietyLevel >= 6 && (
          <div className="space-y-3 bg-gradient-to-br from-yellow-50 to-amber-50 p-5 rounded-lg border border-yellow-200 shadow-sm mt-4">
            <Label className="text-base font-medium text-slate-800">
              הצעות להקלת הסטרס
            </Label>
            <p className="text-sm text-slate-600">
              מה לדעתכם יכול לעזור לחיית המחמד להרגיש יותר בנוח במהלך הביקור?
            </p>
            <Textarea
              value={formData.anxietyHelpSuggestions}
              onChange={(e) => updateFormData('anxietyHelpSuggestions', e.target.value)}
              placeholder="לדוגמה: חטיפים אהובים, משחק מסוים, מוזיקה, זמן נוסף להתרגלות..."
              className="h-24 bg-white border-slate-200 focus:border-amber-400 focus:ring-amber-400"
            />
          </div>
        )}
      </div>
    </div>
  );
}
