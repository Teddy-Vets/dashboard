import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dog, Cat, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function PetInfoStep({ formData, updateFormData, onFileUpload, uploadingFiles = {} }) {
  return (
    <div className="space-y-8">
      <div>
        <Label className="text-lg font-medium text-slate-700 mb-2 block">שם חיית המחמד *</Label>
        <Input
          value={formData.petName || ''}
          onChange={(e) => updateFormData('petName', e.target.value)}
          className="text-lg p-6"
          placeholder="למשל: לבנדר"
          required
          dir="rtl"
        />
      </div>

      <div>
        <Label className="text-lg font-medium text-slate-700 mb-4 block">סוג *</Label>
        <div className="flex gap-4 justify-center" dir="rtl">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => updateFormData('petType', 'כלב')}
            className={`flex-1 p-8 rounded-xl border-3 transition-all ${
              formData.petType === 'כלב'
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
            }`}>
            <Dog className={`w-16 h-16 mx-auto mb-3 ${
              formData.petType === 'כלב' ? 'text-blue-600' : 'text-gray-400'
            }`} />
            <p className={`text-xl font-semibold ${
              formData.petType === 'כלב' ? 'text-blue-700' : 'text-gray-600'
            }`}>כלב</p>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => updateFormData('petType', 'חתול')}
            className={`flex-1 p-8 rounded-xl border-3 transition-all ${
              formData.petType === 'חתול'
                ? 'border-orange-500 bg-orange-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/30'
            }`}>
            <Cat className={`w-16 h-16 mx-auto mb-3 ${
              formData.petType === 'חתול' ? 'text-orange-600' : 'text-gray-400'
            }`} />
            <p className={`text-xl font-semibold ${
              formData.petType === 'חתול' ? 'text-orange-700' : 'text-gray-600'
            }`}>חתול</p>
          </motion.button>
        </div>
      </div>

      <div>
        <Label className="text-lg font-medium text-slate-700 mb-2 block">גזע</Label>
        <Input
          value={formData.petBreed || ''}
          onChange={(e) => updateFormData('petBreed', e.target.value)}
          className="text-lg p-6"
          placeholder="למשל: לברדור, פרסי"
          dir="rtl"
        />
      </div>

      <div>
        <Label className="text-lg font-medium text-slate-700 mb-2 block">גיל משוער</Label>
        <Input
          value={formData.petAge || ''}
          onChange={(e) => updateFormData('petAge', e.target.value)}
          className="text-lg p-6"
          placeholder="למשך: 2.5 שנים"
          dir="rtl"
        />
      </div>

      <div>
        <Label className="text-lg font-medium text-slate-700 mb-2 block">מין</Label>
        <Select value={formData.petGender || ''} onValueChange={(value) => updateFormData('petGender', value)} dir="rtl">
          <SelectTrigger className="text-lg p-6">
            <SelectValue placeholder="בחר מין" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="זכר">זכר</SelectItem>
            <SelectItem value="נקבה">נקבה</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-lg font-medium text-slate-700 mb-2 block">מסורס/מעוקרת</Label>
        <Select value={formData.petNeutered || ''} onValueChange={(value) => updateFormData('petNeutered', value)} dir="rtl">
          <SelectTrigger className="text-lg p-6">
            <SelectValue placeholder="בחר" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="מסורס">מסורס</SelectItem>
            <SelectItem value="מעוקרת">מעוקרת</SelectItem>
            <SelectItem value="לא">לא</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-lg font-medium text-slate-700 mb-2 block">מספר שבב (אם ידוע)</Label>
        <Input
          value={formData.petMicrochip || ''}
          onChange={(e) => updateFormData('petMicrochip', e.target.value)}
          className="text-lg p-6"
          placeholder="מספר השבב האלקטרוני"
          dir="rtl"
        />
      </div>

      {/* File Uploads */}
      <div className="space-y-6">
        <div>
          <Label className="text-lg font-medium text-slate-700 mb-2 block">העלאת תמונה של חיית המחמד</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
            {uploadingFiles.petPictureUrl ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-2" />
                <span className="text-sm text-gray-600">מעלה תמונה...</span>
              </div>
            ) : formData.petPictureUrl ? (
              <div className="relative">
                <img src={formData.petPictureUrl} alt="Pet" className="w-full h-48 object-cover rounded-lg" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => updateFormData('petPictureUrl', '')}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-gray-600">לחץ להעלאת תמונה</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFileUpload(e, 'petPictureUrl')}
                />
              </label>
            )}
          </div>
        </div>

        <div>
          <Label className="text-lg font-medium text-slate-700 mb-2 block">העלאת סיכום טיפולים קודמים</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
            {uploadingFiles.previousTreatmentsFileUrl ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-2" />
                <span className="text-sm text-gray-600">מעלה קובץ...</span>
              </div>
            ) : formData.previousTreatmentsFileUrl ? (
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded">
                <span className="text-sm text-gray-700">קובץ הועלה בהצלחה ✓</span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => updateFormData('previousTreatmentsFileUrl', '')}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-gray-600">לחץ להעלאת קובץ PDF</span>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={(e) => onFileUpload(e, 'previousTreatmentsFileUrl')}
                />
              </label>
            )}
          </div>
        </div>

        <div>
          <Label className="text-lg font-medium text-slate-700 mb-2 block">העלאת פנקס חיסונים</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
            {uploadingFiles.vaccineBookUrl ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-2" />
                <span className="text-sm text-gray-600">מעלה פנקס חיסונים...</span>
              </div>
            ) : formData.vaccineBookUrl ? (
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded">
                <span className="text-sm text-gray-700">קובץ הועלה בהצלחה ✓</span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => updateFormData('vaccineBookUrl', '')}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-gray-600">לחץ להעלאת קובץ PDF</span>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={(e) => onFileUpload(e, 'vaccineBookUrl')}
                />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}