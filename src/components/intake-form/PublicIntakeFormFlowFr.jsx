import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

import PersonalInfoStepFr from "./PersonalInfoStepFr";
import PetInfoStepFr from "./PetInfoStepFr";
import MedicalHistoryStepFr from "./MedicalHistoryStepFr";
import VisitInfoStepFr from "./VisitInfoStepFr";
import ReviewStepFr from "./ReviewStepFr";

import { submitIntake } from "@/functions/submitIntake";

const STEPS = [
  { id: 1, title: "Informations personnelles", component: PersonalInfoStepFr },
  { id: 2, title: "Informations sur l'animal", component: PetInfoStepFr },
  { id: 3, title: "Histoire médicale", component: MedicalHistoryStepFr },
  { id: 4, title: "Informations sur la visite", component: VisitInfoStepFr },
  { id: 5, title: "Révision et envoi", component: ReviewStepFr }
];

export default function PublicIntakeFormFlowFr({ token, formId, initialData = {} }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    ownerName: initialData.owner_name || "",
    ownerIdNumber: "",
    phone: initialData.owner_phone || "",
    email: initialData.owner_email || "",
    address: "",
    firstEverPet: "",
    firstPetStory: "",
    notFirstPetInfo: "",
    petName: initialData.pet_name || "",
    petType: "",
    petBreed: "",
    petAge: "",
    petGender: "",
    petNeutered: "",
    petMicrochip: "",
    petPictureUrl: "",
    vaccineBookUrl: "",
    previousTreatmentsFileUrl: "",
    hasInsurance: "",
    insuranceCompany: "",
    insuranceCompanyName: "",
    insuranceCompanyOther: "",
    noInsuranceReason: "",
    consideringInsuranceNotes: "",
    firstVisit: "",
    howHeardAboutUs: "",
    previousClinicName: "",
    previousPetName: "",
    prevVetLikes: "",
    needsFromUs: "",
    knownMedicalIssues: "",
    dietFoodType: "",
    behavioralIssues: "",
    vetAnxietyLevel: 5,
    anxietyHelpSuggestions: "",
    visitReasonMain: "",
    visitReasonDetails: "",
    otherTopics: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState({});

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event, fieldName) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFiles(prev => ({ ...prev, [fieldName]: true }));

    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      
      if (response && response.file_url) {
        updateFormData(fieldName, response.file_url);
      } else {
        throw new Error("URL non reçue du serveur");
      }
    } catch (error) {
      console.error(`Error uploading file for ${fieldName}:`, error);
      alert(`Erreur lors du téléchargement du fichier: ${error.message || 'Veuillez réessayer'}`);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: // Personal Info
        return (
          formData.ownerName?.trim() !== "" &&
          formData.ownerIdNumber?.trim() !== "" &&
          formData.phone?.trim() !== "" &&
          formData.firstEverPet?.trim() !== ""
        );
      case 2: // Pet Info
        return (
          formData.petName?.trim() !== "" &&
          formData.petType?.trim() !== ""
        );
      case 3: // Medical History
        return formData.vetAnxietyLevel > 0;
      case 4: // Visit Info
        return formData.visitReasonMain?.trim() !== "";
      case 5: // Review Step
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (!formId) {
        throw new Error("Identifiant du formulaire manquant");
      }

      const submissionData = {
        id: formId,
        owner_name: formData.ownerName,
        owner_id_number: formData.ownerIdNumber,
        owner_phone: formData.phone,
        owner_email: formData.email,
        address: formData.address,
        first_ever_pet: formData.firstEverPet,
        first_pet_story: formData.firstPetStory,
        not_first_pet_info: formData.notFirstPetInfo,
        pet_name: formData.petName,
        pet_type: formData.petType,
        pet_breed: formData.petBreed,
        pet_age: formData.petAge,
        pet_gender: formData.petGender,
        pet_neutered: formData.petNeutered,
        pet_microchip: formData.petMicrochip,
        pet_picture_url: formData.petPictureUrl,
        vaccine_book_url: formData.vaccineBookUrl,
        previous_treatments_file_url: formData.previousTreatmentsFileUrl,
        has_insurance: formData.hasInsurance,
        insurance_company: formData.insuranceCompanyName || formData.insuranceCompany,
        insurance_company_other: formData.insuranceCompanyOther,
        no_insurance_reason: formData.noInsuranceReason,
        considering_insurance_notes: formData.consideringInsuranceNotes,
        first_visit: formData.firstVisit,
        how_heard_about_us: formData.howHeardAboutUs,
        previous_clinic_name: formData.previousClinicName,
        previous_pet_name: formData.previousPetName,
        prev_vet_likes: formData.prevVetLikes,
        needs_from_us: formData.needsFromUs,
        known_medical_issues: formData.knownMedicalIssues,
        diet_food_type: formData.dietFoodType,
        behavioral_issues: formData.behavioralIssues,
        vet_anxiety_level: formData.vetAnxietyLevel,
        anxiety_help_suggestions: formData.anxietyHelpSuggestions,
        visit_reason_main: formData.visitReasonMain,
        visit_reason_details: formData.visitReasonDetails,
        other_topics: formData.otherTopics,
        client_consent: true
      };

      console.log('[PublicIntakeFormFlowFr] Submitting with formId:', formId);

      const response = await submitIntake(submissionData);

      if (response.data && response.data.success) {
        setSubmitSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(response.data?.error || "Erreur lors de l'envoi du formulaire");
      }
    } catch (error) {
      console.error("[PublicIntakeFormFlowFr] Error submitting intake form:", error);
      setSubmitError(error.message || "Une erreur s'est produite lors de l'envoi du formulaire. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  if (submitSuccess) {
    return (
      <div dir="ltr" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-green-200">
            <CardContent className="p-12 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto w-24 h-24 bg-green-500 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-16 h-16 text-white" />
              </motion.div>

              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                  Formulaire envoyé avec succès ! 🎉
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Merci d'avoir rempli le formulaire d'accueil.<br />
                  Un représentant de la clinique vous contactera bientôt.
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-lg border-2 border-blue-200">
                <p className="text-slate-700 font-medium">
                  Nous avons enregistré toutes les informations que vous avez fournies et nous prendrons soin de vous de la meilleure façon ! 💙
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div dir="ltr" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Hero Header with Background Image */}
      <div 
        className="relative bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1600&h=900&fit=crop')",
          minHeight: '180px'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-blue-800/70 to-blue-900/80"></div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo on the left */}
            <div className="flex-shrink-0">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687b78971cad562073ed5929/c6a0b9e79_logo_medical.png"
                alt="Teddy Vets"
                className="w-20 md:w-28 h-auto object-contain filter brightness-0 invert"
              />
            </div>

            {/* Text in center */}
            <div className="flex-1 text-center text-white">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 drop-shadow-lg">
                Bienvenue, nous avons hâte de vous rencontrer
              </h1>
              
              <p className="text-xs md:text-sm lg:text-base max-w-3xl mx-auto leading-tight drop-shadow-md">
                Le processus d'accueil est rapide et nous aidera à préparer une visite agréable et personnalisée pour vous et votre animal
              </p>
            </div>

            {/* Spacer for balance */}
            <div className="flex-shrink-0 w-20 md:w-28"></div>
          </div>
        </div>

        {/* Wave SVG at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg 
            viewBox="0 0 1440 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path 
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" 
              fill="#f8fafc"
            />
          </svg>
        </div>
      </div>

      {/* Form Content */}
      <div className="relative -mt-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Step Indicator - Single Row */}
          <div className="mb-8">
            <div className="grid grid-cols-5 gap-2">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`text-center transition-all duration-300 ${
                    step.id === currentStep 
                      ? "transform scale-110" 
                      : ""
                  }`}
                >
                  <div
                    className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all duration-300 ${
                      step.id === currentStep
                        ? "bg-gradient-to-br from-blue-500 to-teal-500 text-white shadow-lg ring-4 ring-blue-200"
                        : step.id < currentStep
                        ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span 
                    className={`text-xs font-medium block ${
                      step.id === currentStep 
                        ? "text-blue-600 font-bold" 
                        : step.id < currentStep 
                        ? "text-green-600" 
                        : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Form Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-blue-100 mb-6 overflow-hidden">
                <CardContent className="p-6 md:p-8 lg:p-10">
                  <CurrentStepComponent 
                    formData={formData} 
                    updateFormData={updateFormData}
                    onFileUpload={handleFileUpload}
                    uploadingFiles={uploadingFiles}
                  />
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-4 pb-8">
                {currentStep > 1 ? (
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="px-6 md:px-10 py-5 md:py-6 text-base md:text-lg font-semibold border-2 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Précédent
                  </Button>
                ) : (
                  <div></div>
                )}

                {currentStep < STEPS.length ? (
                  <Button
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-6 md:px-10 py-5 md:py-6 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !canProceed()}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 md:px-10 py-5 md:py-6 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 ml-2" />
                        Envoyer le formulaire
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg text-red-800 text-center"
            >
              {submitError}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}