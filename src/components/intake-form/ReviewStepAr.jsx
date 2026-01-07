import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ReviewStepAr({ formData }) {
  const renderField = (label, value) => {
    if (!value) return null;
    
    return (
      <div className="flex justify-between py-3 border-b border-slate-100 last:border-0">
        <span className="font-medium text-slate-600">{label}:</span>
        <span className="text-slate-800 text-right max-w-md">{value}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">ملخص النموذج</h3>
        <p className="text-slate-600">يرجى التحقق من صحة جميع المعلومات قبل الإرسال</p>
      </div>

      <Card className="border-2 border-blue-100">
        <CardContent className="p-6">
          <h4 className="font-bold text-lg text-blue-800 mb-4">👤 المعلومات الشخصية</h4>
          {renderField("الاسم الكامل", formData.ownerName)}
          {renderField("رقم الهوية", formData.ownerIdNumber)}
          {renderField("الهاتف", formData.phone)}
          {renderField("البريد الإلكتروني", formData.email)}
          {renderField("العنوان", formData.address)}
          {renderField("أول حيوان أليف", formData.firstEverPet === "yes" ? "نعم" : formData.firstEverPet === "no" ? "لا" : "")}
          {renderField("قصة الحيوان الأول", formData.firstPetStory)}
          {renderField("معلومات عن الحيوانات الأخرى", formData.notFirstPetInfo)}
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-100">
        <CardContent className="p-6">
          <h4 className="font-bold text-lg text-blue-800 mb-4">🐾 معلومات الحيوان الأليف</h4>
          {renderField("اسم الحيوان", formData.petName)}
          {renderField("نوع الحيوان", formData.petType)}
          {renderField("السلالة", formData.petBreed)}
          {renderField("العمر", formData.petAge)}
          {renderField("الجنس", formData.petGender)}
          {renderField("مخصي/معقم", formData.petNeutered)}
          {renderField("رقم الشريحة", formData.petMicrochip)}
          {formData.petPictureUrl && <div className="py-3"><Label>صورة الحيوان: </Label><span className="text-green-600">✓ تم الرفع</span></div>}
          {formData.vaccineBookUrl && <div className="py-3"><Label>دفتر التطعيمات: </Label><span className="text-green-600">✓ تم الرفع</span></div>}
          {formData.previousTreatmentsFileUrl && <div className="py-3"><Label>العلاجات السابقة: </Label><span className="text-green-600">✓ تم الرفع</span></div>}
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-100">
        <CardContent className="p-6">
          <h4 className="font-bold text-lg text-blue-800 mb-4">🏥 التاريخ الطبي</h4>
          {renderField("الزيارة الأولى", formData.firstVisit === "yes" ? "نعم" : formData.firstVisit === "no" ? "لا" : "")}
          {renderField("كيف سمعت عنا", formData.howHeardAboutUs)}
          {renderField("العيادة السابقة", formData.previousClinicName)}
          {renderField("الحيوان السابق لدينا", formData.previousPetName)}
          {renderField("ما كان جيداً في الطبيب السابق", formData.prevVetLikes)}
          {renderField("التوقعات منا", formData.needsFromUs)}
          {renderField("المشاكل الطبية المعروفة", formData.knownMedicalIssues)}
          {renderField("نوع الطعام", formData.dietFoodType)}
          {renderField("المشاكل السلوكية", formData.behavioralIssues)}
          {renderField("مستوى القلق عند الطبيب البيطري", `${formData.vetAnxietyLevel}/10`)}
          {renderField("اقتراحات لتقليل القلق", formData.anxietyHelpSuggestions)}
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-100">
        <CardContent className="p-6">
          <h4 className="font-bold text-lg text-blue-800 mb-4">📋 معلومات الزيارة</h4>
          {renderField("السبب الرئيسي للزيارة", formData.visitReasonMain)}
          {renderField("تفاصيل إضافية", formData.visitReasonDetails)}
          {renderField("مواضيع أخرى", formData.otherTopics)}
        </CardContent>
      </Card>

      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
        <p className="text-green-800 font-medium text-center">
          ✓ بإرسال هذا النموذج، فإنك توافق على حفظ ومعالجة هذه المعلومات لتقديم أفضل خدمة بيطرية لك.
        </p>
      </div>
    </div>
  );
}