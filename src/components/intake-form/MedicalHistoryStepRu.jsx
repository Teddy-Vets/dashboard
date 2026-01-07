import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { AlertCircle } from 'lucide-react';

export default function MedicalHistoryStepRu({ formData, updateFormData }) {
  return (
    <div className="space-y-8">
      {/* Первый визит */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-700 flex items-center gap-2">
          <span className="text-red-500">*</span>
          Это ваш первый раз у ветеринара?
        </Label>
        <RadioGroup 
          value={formData.firstVisit} 
          onValueChange={(value) => updateFormData('firstVisit', value)}
          className="space-y-2"
        >
          <div className="flex items-center justify-start space-x-2">
            <RadioGroupItem value="yes" id="first-visit-yes" />
            <Label htmlFor="first-visit-yes" className="cursor-pointer font-normal">Да, это первый раз</Label>
          </div>
          <div className="flex items-center justify-start space-x-2">
            <RadioGroupItem value="no" id="first-visit-no" />
            <Label htmlFor="first-visit-no" className="cursor-pointer font-normal">Нет, переходим из другой клиники</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Условные вопросы в зависимости от ответа */}
      {formData.firstVisit === 'yes' && (
        <div className="space-y-3 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100 shadow-sm">
          <Label className="text-base font-medium text-slate-800">
            Как вы узнали о клинике?
          </Label>
          <Input
            value={formData.howHeardAboutUs}
            onChange={(e) => updateFormData('howHeardAboutUs', e.target.value)}
            placeholder="Например: Рекомендация друзей, реклама, поиск в интернете..."
            className="bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400"
          />
        </div>
      )}

      {formData.firstVisit === 'no' && (
        <div className="space-y-6 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
          <div className="space-y-3">
            <Label className="text-base font-medium text-slate-800">
              Название предыдущей клиники/ветеринара
            </Label>
            <Input
              value={formData.previousClinicName}
              onChange={(e) => updateFormData('previousClinicName', e.target.value)}
              placeholder="Название клиники или ветеринара"
              className="bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-400"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium text-slate-800">
              Что вам понравилось у предыдущего ветеринара?
            </Label>
            <Textarea
              value={formData.prevVetLikes}
              onChange={(e) => updateFormData('prevVetLikes', e.target.value)}
              placeholder="Что было хорошо? Это поможет нам понять, что для вас важно"
              className="bg-white h-24 border-slate-200 focus:border-indigo-400 focus:ring-indigo-400"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium text-slate-800">
              Что для вас важно в нашей клинике?
            </Label>
            <Textarea
              value={formData.needsFromUs}
              onChange={(e) => updateFormData('needsFromUs', e.target.value)}
              placeholder="Мы будем рады узнать, что для вас особенно важно..."
              className="bg-white h-24 border-slate-200 focus:border-indigo-400 focus:ring-indigo-400"
            />
          </div>
        </div>
      )}

      {/* Известные медицинские проблемы */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-800">
          Известные медицинские/поведенческие проблемы
        </Label>
        <p className="text-sm text-slate-500">
          Например: Аллергии, хронические заболевания, лай, особые медицинские состояния
        </p>
        <Textarea
          value={formData.knownMedicalIssues}
          onChange={(e) => updateFormData('knownMedicalIssues', e.target.value)}
          placeholder="Пожалуйста, опишите подробнее..."
          className="h-24 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
        />
      </div>

      {/* Тип корма */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-800">
          Тип корма
        </Label>
        <p className="text-sm text-slate-500">
          Например: Сухой/влажный, марка, частота кормления, специальные порции
        </p>
        <Textarea
          value={formData.dietFoodType}
          onChange={(e) => updateFormData('dietFoodType', e.target.value)}
          placeholder="Опишите тип корма, марку, количество и т.д..."
          className="h-24 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
        />
      </div>

    
      {/* Уровень тревожности у ветеринара */}
      <div className="space-y-4 bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <Label className="text-base font-medium text-slate-800">
            Уровень тревожности у ветеринара
          </Label>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Уровень тревожности (1 = очень спокоен, 10 = очень напряжен)
        </p>
        
        <div className="bg-white p-5 rounded-lg border border-amber-100 shadow-sm">
          <Slider
            value={[formData.vetAnxietyLevel]}
            onValueChange={(value) => updateFormData('vetAnxietyLevel', value[0])}
            min={1}
            max={10}
            step={1}
            className="mb-4"
          />
          
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-emerald-600">Спокоен (1)</span>
            <span className="text-2xl font-bold text-amber-600">{formData.vetAnxietyLevel}</span>
            <span className="text-rose-600">Высокая тревожность (10)</span>
          </div>
        </div>

        {formData.vetAnxietyLevel >= 6 && (
          <div className="space-y-3 bg-gradient-to-br from-yellow-50 to-amber-50 p-5 rounded-lg border border-yellow-200 shadow-sm mt-4">
            <Label className="text-base font-medium text-slate-800">
              Предложения по снижению стресса
            </Label>
            <p className="text-sm text-slate-600">
              Что, по вашему мнению, может помочь вашему питомцу чувствовать себя комфортнее во время визита?
            </p>
            <Textarea
              value={formData.anxietyHelpSuggestions}
              onChange={(e) => updateFormData('anxietyHelpSuggestions', e.target.value)}
              placeholder="Например: Любимые лакомства, определенная игрушка, музыка, дополнительное время для адаптации..."
              className="h-24 bg-white border-slate-200 focus:border-amber-400 focus:ring-amber-400"
            />
          </div>
        )}
      </div>
    </div>
  );
}