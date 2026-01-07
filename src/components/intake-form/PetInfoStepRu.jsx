import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dog, Cat, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function PetInfoStepRu({ formData, updateFormData, onFileUpload, uploadingFiles = {} }) {
  return (
    <div className="space-y-8">
      <div>
        <Label className="text-lg font-medium text-slate-700 mb-2 block">Кличка питомца *</Label>
        <Input
          value={formData.petName || ''}
          onChange={(e) => updateFormData('petName', e.target.value)}
          className="text-lg p-6"
          placeholder="например: Лаванда"
          required
        />
      </div>

      <div>
        <Label className="text-lg font-medium text-slate-700 mb-4 block">Тип *</Label>
        <div className="flex gap-4 justify-center">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => updateFormData('petType', 'Собака')}
            className={`flex-1 p-8 rounded-xl border-3 transition-all ${
              formData.petType === 'Собака'
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
            }`}>
            <Dog className={`w-16 h-16 mx-auto mb-3 ${
              formData.petType === 'Собака' ? 'text-blue-600' : 'text-gray-400'
            }`} />
            <p className={`text-xl font-semibold ${
              formData.petType === 'Собака' ? 'text-blue-700' : 'text-gray-600'
            }`}>Собака</p>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => updateFormData('petType', 'Кошка')}
            className={`flex-1 p-8 rounded-xl border-3 transition-all ${
              formData.petType === 'Кошка'
                ? 'border-orange-500 bg-orange-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/30'
            }`}>
            <Cat className={`w-16 h-16 mx-auto mb-3 ${
              formData.petType === 'Кошка' ? 'text-orange-600' : 'text-gray-400'
            }`} />
            <p className={`text-xl font-semibold ${
              formData.petType === 'Кошка' ? 'text-orange-700' : 'text-gray-600'
            }`}>Кошка</p>
          </motion.button>
        </div>
      </div>

      <div>
        <Label className="text-lg font-medium text-slate-700 mb-2 block">Порода</Label>
        <Input
          value={formData.petBreed || ''}
          onChange={(e) => updateFormData('petBreed', e.target.value)}
          className="text-lg p-6"
          placeholder="например: Лабрадор, Персидская"
        />
      </div>

      <div>
        <Label className="text-lg font-medium text-slate-700 mb-2 block">Приблизительный возраст</Label>
        <Input
          value={formData.petAge || ''}
          onChange={(e) => updateFormData('petAge', e.target.value)}
          className="text-lg p-6"
          placeholder="например: 2.5 года"
        />
      </div>

      <div>
        <Label className="text-lg font-medium text-slate-700 mb-2 block">Пол</Label>
        <Select value={formData.petGender || ''} onValueChange={(value) => updateFormData('petGender', value)}>
          <SelectTrigger className="text-lg p-6">
            <SelectValue placeholder="Выберите пол" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Самец">Самец</SelectItem>
            <SelectItem value="Самка">Самка</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-lg font-medium text-slate-700 mb-2 block">Кастрирован/Стерилизована</Label>
        <Select value={formData.petNeutered || ''} onValueChange={(value) => updateFormData('petNeutered', value)}>
          <SelectTrigger className="text-lg p-6">
            <SelectValue placeholder="Выберите" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Кастрирован">Кастрирован</SelectItem>
            <SelectItem value="Стерилизована">Стерилизована</SelectItem>
            <SelectItem value="Нет">Нет</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-lg font-medium text-slate-700 mb-2 block">Номер микрочипа (если известен)</Label>
        <Input
          value={formData.petMicrochip || ''}
          onChange={(e) => updateFormData('petMicrochip', e.target.value)}
          className="text-lg p-6"
          placeholder="Номер электронного чипа"
        />
      </div>

      {/* File Uploads */}
      <div className="space-y-6">
        <div>
          <Label className="text-lg font-medium text-slate-700 mb-2 block">Загрузить фото питомца</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
            {uploadingFiles.petPictureUrl ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-2" />
                <span className="text-sm text-gray-600">Загрузка фото...</span>
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
                <span className="text-gray-600">Нажмите для загрузки фото</span>
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
          <Label className="text-lg font-medium text-slate-700 mb-2 block">Загрузить историю предыдущих процедур</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
            {uploadingFiles.previousTreatmentsFileUrl ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-2" />
                <span className="text-sm text-gray-600">Загрузка файла...</span>
              </div>
            ) : formData.previousTreatmentsFileUrl ? (
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded">
                <span className="text-sm text-gray-700">Файл успешно загружен ✓</span>
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
                <span className="text-gray-600">Нажмите для загрузки PDF файла</span>
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
          <Label className="text-lg font-medium text-slate-700 mb-2 block">Загрузить ветеринарный паспорт</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
            {uploadingFiles.vaccineBookUrl ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-2" />
                <span className="text-sm text-gray-600">Загрузка паспорта прививок...</span>
              </div>
            ) : formData.vaccineBookUrl ? (
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded">
                <span className="text-sm text-gray-700">Файл успешно загружен ✓</span>
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
                <span className="text-gray-600">Нажмите для загрузки PDF файла</span>
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