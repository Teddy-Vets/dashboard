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

export default function ReviewStepRu({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Резюме и подтверждение данных</h3>
        <p className="text-slate-600">Пожалуйста, проверьте правильность введенных данных перед отправкой</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReviewSection title="Личная информация" icon={User}>
          <ReviewItem label="Полное имя" value={formData.ownerName} />
          <ReviewItem label="Телефон" value={formData.phone} />
          <ReviewItem label="Email" value={formData.email} />
          <ReviewItem label="Адрес" value={formData.address} />
        </ReviewSection>

        <ReviewSection title="Информация о питомце" icon={PawPrint}>
          <ReviewItem label="Кличка" value={formData.petName} />
          <ReviewItem label="Тип" value={formData.petType} />
          <ReviewItem label="Порода" value={formData.petBreed} />
          <ReviewItem label="Возраст" value={formData.petAge} />
          <ReviewItem label="Пол" value={formData.petGender} />
          <ReviewItem label="Кастрирован/Стерилизована" value={formData.petNeutered} />
        </ReviewSection>
        
        <ReviewSection title="Медицинская история" icon={Heart}>
          <ReviewItem label="Первый визит" value={formData.firstVisit === 'yes' ? 'Да' : 'Нет'} />
          <ReviewItem label="Известные проблемы" value={formData.knownMedicalIssues} />
          <ReviewItem label="Питание" value={formData.dietFoodType} />
          <ReviewItem label="Поведенческие проблемы" value={formData.behavioralIssues} />
          <ReviewItem label="Уровень тревожности" value={formData.vetAnxietyLevel} />
        </ReviewSection>

        <ReviewSection title="Информация о визите" icon={Info}>
          <ReviewItem label="Причина визита" value={formData.visitReasonMain} />
          <ReviewItem label="Детали" value={formData.visitReasonDetails} />
          <ReviewItem label="Дополнительные темы" value={formData.otherTopics} />
        </ReviewSection>
      </div>

      <div className="pt-6 border-t border-slate-200">
        <div className="flex items-center space-x-2 bg-blue-50 p-4 rounded-lg">
          <input
            type="checkbox"
            id="terms"
            checked={formData.client_consent || false}
            onChange={(e) => updateFormData('client_consent', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded ml-2"
          />
          <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Я подтверждаю, что предоставленная мной информация верна, и соглашаюсь с условиями обслуживания клиники.
          </Label>
        </div>
      </div>
    </div>
  );
}