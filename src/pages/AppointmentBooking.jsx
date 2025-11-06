import React, { useState, useEffect, lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { AppointmentRequest } from "@/entities/all";
import { createEntity } from "@/components/utils/apiHelpers";

// Lazy load components
const HeroSection = lazy(() => import("@/components/appointment/HeroSection"));
const WhatsAppButton = lazy(() => import("@/components/appointment/WhatsAppButton"));

// Lazy load step components - יטענו רק כשצריך אותם
const CustomerTypeScreen = lazy(() => import("@/components/appointment/CustomerTypeScreen"));
const ContactDetailsScreen = lazy(() => import("@/components/appointment/ContactDetailsScreen"));
const ServiceSelectionScreen = lazy(() => import("@/components/appointment/ServiceSelectionScreen"));
const VaccinationDetailsScreen = lazy(() => import("@/components/appointment/VaccinationDetailsScreen"));
const MedicalVisitDetailsScreen = lazy(() => import("@/components/appointment/MedicalVisitDetailsScreen"));
const DateTimeSelectionScreen = lazy(() => import("@/components/appointment/DateTimeSelectionScreen"));
const ReviewScreen = lazy(() => import("@/components/appointment/ReviewScreen"));
const SuccessScreen = lazy(() => import("@/components/appointment/SuccessScreen"));

// Loading fallback component
const StepLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="xl" />
  </div>
);

export default function AppointmentBookingPage() {
  const [currentStep, setCurrentStep] = useState('hero');
  const [formData, setFormData] = useState({
    clinic_id: '',
    clinic_name: '',
    customerType: '',
    petType: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    petName: '',
    request_type: '',
    vaccination_types: [],
    medical_reason: '',
    preferred_date: '',
    preferred_time: '',
    notes: '',
    signature: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = (stepData) => {
    if (stepData && typeof stepData === 'object') {
      setFormData((prev) => ({ ...prev, ...stepData }));
    }

    switch (currentStep) {
      case 'hero':
        setCurrentStep('customer-type');
        break;
      case 'customer-type':
        setCurrentStep('contact-details');
        break;
      case 'contact-details':
        setCurrentStep('service-selection');
        break;
      case 'service-selection':
        if (stepData === 'vaccination') {
          setCurrentStep('vaccination-details');
        } else {
          setCurrentStep('medical-visit-details');
        }
        break;
      case 'vaccination-details':
      case 'medical-visit-details':
        setCurrentStep('datetime-selection');
        break;
      case 'datetime-selection':
        setCurrentStep('review-and-submit');
        break;
      case 'review-and-submit':
        setCurrentStep('thank-you');
        break;
      default:
        setCurrentStep('hero');
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'customer-type':
        setCurrentStep('hero');
        break;
      case 'contact-details':
        setCurrentStep('customer-type');
        break;
      case 'service-selection':
        setCurrentStep('contact-details');
        break;
      case 'vaccination-details':
        setCurrentStep('service-selection');
        break;
      case 'medical-visit-details':
        setCurrentStep('service-selection');
        break;
      case 'datetime-selection':
        if (formData.request_type === 'vaccination') {
          setCurrentStep('vaccination-details');
        } else {
          setCurrentStep('medical-visit-details');
        }
        break;
      case 'review-and-submit':
        setCurrentStep('datetime-selection');
        break;
      default:
        break;
    }
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        clinic_id: formData.clinic_id,
        customer_type: formData.customerType,
        owner_name: formData.ownerName,
        owner_phone: formData.ownerPhone,
        owner_email: formData.ownerEmail,
        pet_name: formData.petName,
        pet_type: formData.petType || null,
        request_type: formData.request_type,
        vaccination_types: formData.vaccination_types || [],
        medical_reason: formData.medical_reason || null,
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time,
        notes: formData.notes || null,
        signature: formData.signature || null,
        status: 'submitted'
      };

      const appointmentRequest = await createEntity(AppointmentRequest, payload, 'AppointmentRequest');

      if (formData.ownerEmail && appointmentRequest) {
        try {
          const { handleAppointmentBooking } = await import('@/functions/handleAppointmentBooking');
          await handleAppointmentBooking(appointmentRequest);
        } catch (journeyError) {
          console.warn('Customer journey failed, but appointment was saved:', journeyError);
        }
      }

      handleNext();
    } catch (error) {
      console.error('Error submitting appointment request:', error);
      alert('אירעה שגיאה בשליחת הבקשה. אנא נסו שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'hero':
        return <HeroSection onStart={handleNext} />;
      case 'customer-type':
        return <CustomerTypeScreen formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />;
      case 'contact-details':
        return <ContactDetailsScreen formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />;
      case 'service-selection':
        return <ServiceSelectionScreen formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />;
      case 'vaccination-details':
        return <VaccinationDetailsScreen formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />;
      case 'medical-visit-details':
        return <MedicalVisitDetailsScreen formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />;
      case 'datetime-selection':
        return <DateTimeSelectionScreen formData={formData} setFormData={setFormData} onNext={handleNext} onBack={handleBack} />;
      case 'review-and-submit':
        return <ReviewScreen formData={formData} onBack={handleBack} onSubmit={handleSubmitBooking} isSubmitting={isSubmitting} />;
      case 'thank-you':
        return <SuccessScreen formData={formData} />;
      default:
        return <HeroSection onStart={handleNext} />;
    }
  };

  return (
    <div dir="rtl" className="min-h-screen">
      <Suspense fallback={<StepLoader />}>
        <AnimatePresence mode="wait">
          {renderCurrentStep()}
        </AnimatePresence>
        {!['hero', 'thank-you'].includes(currentStep) && <WhatsAppButton />}
      </Suspense>
    </div>
  );
}