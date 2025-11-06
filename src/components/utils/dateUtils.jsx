/**
 * dateUtils.js - כלי עזר לטיפול אחיד בתאריכים ושעות
 * כל התאריכים והשעות במערכת יתנהגו באופן עקבי באזור הזמן של ישראל
 */

import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

// אזור הזמן הקבוע של המערכת
const ISRAEL_TIMEZONE = 'Asia/Jerusalem';

/**
 * המרת תאריך מ-UTC לאזור זמן ישראל ועיצוב לתצוגה
 * @param {string} isoDateString - תאריך בפורמט ISO (UTC)
 * @param {string} formatPattern - תבנית העיצוב (לפי date-fns)
 * @returns {string} תאריך מעוצב
 */
export const formatDateInIsrael = (isoDateString, formatPattern = 'dd/MM/yyyy') => {
  if (!isoDateString) return '';
  
  try {
    const date = parseISO(isoDateString);
    return format(date, formatPattern, { locale: he });
  } catch (error) {
    console.warn('Error formatting date:', error);
    return '';
  }
};

/**
 * המרת תאריך ושעה מ-UTC לאזור זמן ישראל ועיצוב לתצוגה
 * @param {string} isoDateString - תאריך ושעה בפורמט ISO (UTC)
 * @param {string} formatPattern - תבנית העיצוב
 * @returns {string} תאריך ושעה מעוצבים
 */
export const formatDateTimeInIsrael = (isoDateString, formatPattern = 'dd/MM/yyyy HH:mm') => {
  if (!isoDateString) return '';
  
  try {
    const date = parseISO(isoDateString);
    return format(date, formatPattern, { locale: he });
  } catch (error) {
    console.warn('Error formatting datetime:', error);
    return '';
  }
};

/**
 * עיצוב תאריך בצורה ידידותית (לדוגמה: "לפני שעתיים", "אתמול")
 * @param {string} isoDateString - תאריך בפורמט ISO (UTC)
 * @returns {string} תאריך בפורמט ידידותי
 */
export const formatRelativeDate = (isoDateString) => {
  if (!isoDateString) return '';
  
  try {
    const date = parseISO(isoDateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: he });
  } catch (error) {
    console.warn('Error formatting relative date:', error);
    return '';
  }
};

/**
 * עיצוב תאריך לתצוגה בפורמט מקומי ישראלי
 * @param {string} isoDateString - תאריך בפורמט ISO
 * @returns {string} תאריך בפורמט מקומי
 */
export const formatLocalDate = (isoDateString) => {
  return formatDateInIsrael(isoDateString, 'd MMMM yyyy');
};

/**
 * עיצוב שעה בלבד
 * @param {string} isoDateString - תאריך ושעה בפורמט ISO
 * @returns {string} שעה בפורמט HH:mm
 */
export const formatTimeOnly = (isoDateString) => {
  return formatDateTimeInIsrael(isoDateString, 'HH:mm');
};

/**
 * בדיקה האם תאריך הוא היום
 * @param {string} isoDateString - תאריך בפורמט ISO
 * @returns {boolean} האם התאריך הוא היום
 */
export const isToday = (isoDateString) => {
  if (!isoDateString) return false;
  
  try {
    const date = parseISO(isoDateString);
    const today = new Date();
    return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  } catch (error) {
    console.warn('Error checking if date is today:', error);
    return false;
  }
};

/**
 * בדיקה האם תאריך הוא מחר
 * @param {string} isoDateString - תאריך בפורמט ISO
 * @returns {boolean} האם התאריך הוא מחר
 */
export const isTomorrow = (isoDateString) => {
  if (!isoDateString) return false;
  
  try {
    const date = parseISO(isoDateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd');
  } catch (error) {
    console.warn('Error checking if date is tomorrow:', error);
    return false;
  }
};

/**
 * המרת תאריך מקלט HTML date לפורמט ISO לשמירה ב-DB
 * @param {string} htmlDateString - תאריך משדה HTML date (YYYY-MM-DD)
 * @param {string} timeString - שעה אופציונלית (HH:mm)
 * @returns {string} תאריך בפורמט ISO
 */
export const convertHtmlDateToISO = (htmlDateString, timeString = '') => {
  if (!htmlDateString) return '';
  
  try {
    const dateTimeString = timeString ? `${htmlDateString}T${timeString}:00` : `${htmlDateString}T00:00:00`;
    const date = new Date(dateTimeString);
    return date.toISOString();
  } catch (error) {
    console.warn('Error converting HTML date to ISO:', error);
    return '';
  }
};

/**
 * המרת תאריך מ-ISO לפורמט HTML date input
 * @param {string} isoDateString - תאריך בפורמט ISO
 * @returns {string} תאריך בפורמט YYYY-MM-DD
 */
export const convertISOToHtmlDate = (isoDateString) => {
  if (!isoDateString) return '';
  
  try {
    const date = parseISO(isoDateString);
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.warn('Error converting ISO to HTML date:', error);
    return '';
  }
};

/**
 * יצירת תאריך נוכחי בפורמט ISO
 * @returns {string} תאריך נוכחי בפורמט ISO
 */
export const getCurrentDateISO = () => {
  return new Date().toISOString();
};

/**
 * יצירת תאריך נוכחי בפורמט HTML date
 * @returns {string} תאריך נוכחי בפורמט YYYY-MM-DD
 */
export const getCurrentDateHTML = () => {
  return format(new Date(), 'yyyy-MM-dd');
};