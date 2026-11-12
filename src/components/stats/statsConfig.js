export const FORM_TYPES = [
  { key: 'intake', entity: 'IntakeForm', label: 'טפסי היכרות', color: '#3b82f6' },
  { key: 'consent', entity: 'ConsentForm', label: 'טפסי הסכמה', color: '#8b5cf6' },
  { key: 'appointment', entity: 'AppointmentRequest', label: 'בקשות תור', color: '#10b981' },
  { key: 'subscription', entity: 'SubscriptionAgreement', label: 'הסכמי מנוי', color: '#f59e0b' },
];

export const SECONDARY_TYPES = [
  { key: 'anxiety', entity: 'AnxietyQuestionnaire', label: 'שאלוני חרדה', color: '#ec4899' },
  { key: 'emergency', entity: 'EmergencyTriage', label: 'קריאות חירום', color: '#ef4444' },
];

export const FORM_FUNNELS = [
  {
    key: 'intake',
    entity: 'IntakeForm',
    label: 'טפסי היכרות',
    color: '#3b82f6',
    returnedStatuses: ['submitted', 'reviewed', 'completed'],
    reviewedStatuses: ['reviewed', 'completed'],
  },
  {
    key: 'consent',
    entity: 'ConsentForm',
    label: 'טפסי הסכמה',
    color: '#8b5cf6',
    returnedStatuses: ['signed', 'completed', 'legally_sealed'],
    reviewedStatuses: ['completed', 'legally_sealed'],
  },
  {
    key: 'anxiety',
    entity: 'AnxietyQuestionnaire',
    label: 'שאלוני חרדה',
    color: '#ec4899',
    returnedStatuses: ['completed', 'reviewed'],
    reviewedStatuses: ['reviewed'],
  },
];

export const RANGE_OPTIONS = [
  { value: '30d', label: '30 ימים אחרונים' },
  { value: '3m', label: '3 חודשים' },
  { value: '6m', label: '6 חודשים' },
  { value: '12m', label: '12 חודשים' },
  { value: 'year', label: 'מתחילת השנה' },
];

export const INTAKE_STATUS_LABELS = {
  draft: 'נשלח, טרם מולא',
  submitted: 'ממתין לבדיקה',
  reviewed: 'נבדק',
  completed: 'הושלם',
  archived: 'בארכיון',
};

export const INTAKE_STATUS_COLORS = {
  draft: '#94a3b8',
  submitted: '#f59e0b',
  reviewed: '#3b82f6',
  completed: '#10b981',
  archived: '#cbd5e1',
};

export const APPOINTMENT_STATUS_LABELS = {
  draft: 'טיוטה',
  submitted: 'ממתין לאישור',
  confirmed: 'אושר',
  completed: 'הושלם',
  cancelled: 'בוטל',
};

export const APPOINTMENT_STATUS_COLORS = {
  draft: '#94a3b8',
  submitted: '#f59e0b',
  confirmed: '#3b82f6',
  completed: '#10b981',
  cancelled: '#ef4444',
};

export const PLAN_LABELS = {
  teddy_basic: 'טדי בייסיק',
  teddy_plus: 'טדי פלוס',
  teddy_platinum: 'טדי פלטינום',
  teddy_royal: 'טדי רויאל',
  teddy_insured: 'טדי מבוטחים',
};

export const PLAN_COLORS = {
  teddy_basic: '#60a5fa',
  teddy_plus: '#34d399',
  teddy_platinum: '#a78bfa',
  teddy_royal: '#fbbf24',
  teddy_insured: '#f472b6',
};

export const VISIT_TYPE_LABELS = {
  yes: 'ביקור ראשון',
  no: 'לא ביקור ראשון',
  previous_pet: 'טיפלנו בחיית מחמד קודמת',
};

export const VISIT_TYPE_COLORS = {
  yes: '#3b82f6',
  no: '#10b981',
  previous_pet: '#f59e0b',
};

export const SEVERITY_LABELS = {
  RED: 'קריטי',
  ORANGE: 'דחוף',
  YELLOW: 'מעקב',
  GREEN: 'רגיל',
};

export const SEVERITY_COLORS = {
  RED: '#ef4444',
  ORANGE: '#f97316',
  YELLOW: '#eab308',
  GREEN: '#22c55e',
};

export const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b'];

const PET_TYPE_NORMALIZATION = {
  dog: 'כלב',
  собака: 'כלב',
  cat: 'חתול',
  кошка: 'חתול',
};

export function normalizePetType(value) {
  const raw = (value || '').trim();
  if (!raw) return 'לא צוין';
  return PET_TYPE_NORMALIZATION[raw.toLowerCase()] || raw;
}