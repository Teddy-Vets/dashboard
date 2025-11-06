import { base44 } from '@/api/base44Client';

/**
 * API Helpers - ניהול שגיאות ופונקציות עזר לעבודה עם Base44 SDK
 */

/**
 * טיפול אחיד בשגיאות API
 */
export class ApiError extends Error {
  constructor(message, status, originalError) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.originalError = originalError;
  }
}

/**
 * מעטפת לביצוע קריאות API עם טיפול שגיאות אחיד
 */
export const safeApiCall = async (apiFunction, errorContext = '') => {
  try {
    return await apiFunction();
  } catch (error) {
    console.error(`[${errorContext}] API Error:`, error);
    
    // טיפול בסוגי שגיאות שונים
    if (error?.status === 401 || error?.message?.includes('Unauthorized')) {
      throw new ApiError(
        'נדרשת התחברות למערכת',
        401,
        error
      );
    }
    
    if (error?.status === 403) {
      throw new ApiError(
        'אין הרשאה לבצע פעולה זו',
        403,
        error
      );
    }
    
    if (error?.status === 404) {
      throw new ApiError(
        'המידע המבוקש לא נמצא',
        404,
        error
      );
    }
    
    if (error?.status === 500) {
      throw new ApiError(
        'שגיאה בשרת. אנא נסה שוב מאוחר יותר',
        500,
        error
      );
    }
    
    // אם זו שגיאת רשת כללית
    if (error?.message?.includes('Network Error') || error?.message?.includes('Failed to fetch')) {
      throw new ApiError(
        'בעיית תקשורת עם השרת. אנא בדוק את החיבור לאינטרנט',
        0,
        error
      );
    }
    
    // שגיאה כללית
    throw new ApiError(
      error?.message || 'אירעה שגיאה בטעינת הנתונים. אנא נסה שוב',
      error?.status || 0,
      error
    );
  }
};

/**
 * טעינת ישות בודדת לפי ID באמצעות filter (יותר יציב מ-get)
 */
export const getEntityById = async (Entity, id, errorContext = 'Entity') => {
  if (!id) {
    throw new ApiError(`מזהה ${errorContext} חסר`, 400);
  }
  
  return safeApiCall(async () => {
    const results = await Entity.filter({ id });
    
    if (!results || results.length === 0) {
      throw new ApiError(`${errorContext} לא נמצא`, 404);
    }
    
    return results[0];
  }, `getEntityById-${errorContext}`);
};

/**
 * טעינת רשימת ישויות עם סינון אופציונלי
 */
export const getEntityList = async (Entity, filters = {}, sortBy = '-created_date', limit = null, errorContext = 'Entity') => {
  return safeApiCall(async () => {
    if (Object.keys(filters).length === 0) {
      return limit ? await Entity.list(sortBy, limit) : await Entity.list(sortBy);
    } else {
      return limit ? await Entity.filter(filters, sortBy, limit) : await Entity.filter(filters, sortBy);
    }
  }, `getEntityList-${errorContext}`);
};

/**
 * יצירת ישות חדשה
 */
export const createEntity = async (Entity, data, errorContext = 'Entity') => {
  return safeApiCall(async () => {
    return await Entity.create(data);
  }, `createEntity-${errorContext}`);
};

/**
 * עדכון ישות
 */
export const updateEntity = async (Entity, id, data, errorContext = 'Entity') => {
  if (!id) {
    throw new ApiError(`מזהה ${errorContext} חסר`, 400);
  }
  
  return safeApiCall(async () => {
    return await Entity.update(id, data);
  }, `updateEntity-${errorContext}`);
};

/**
 * מחיקת ישות
 */
export const deleteEntity = async (Entity, id, errorContext = 'Entity') => {
  if (!id) {
    throw new ApiError(`מזהה ${errorContext} חסר`, 400);
  }
  
  return safeApiCall(async () => {
    return await Entity.delete(id);
  }, `deleteEntity-${errorContext}`);
};

/**
 * קבלת פרטי המשתמש הנוכחי
 */
export const getCurrentUser = async () => {
  try {
    const user = await base44.auth.me();
    return user;
  } catch (error) {
    // אם המשתמש לא מחובר, נחזיר null במקום לזרוק שגיאה
    if (error?.status === 401 || error?.message?.includes('Unauthorized')) {
      console.log('[getCurrentUser] User not authenticated');
      return null;
    }
    console.error('[getCurrentUser] API Error:', error);
    throw new ApiError(
      'שגיאה בטעינת פרטי המשתמש',
      error?.status || 0,
      error
    );
  }
};

/**
 * בדיקה האם המשתמש הוא אדמין
 */
export const isAdmin = async () => {
  try {
    const user = await getCurrentUser();
    return user?.role === 'admin';
  } catch {
    return false;
  }
};

/**
 * קבלת clinic_id של המשתמש הנוכחי
 */
export const getUserClinicId = async () => {
  try {
    const user = await getCurrentUser();
    return user?.clinic_id || null;
  } catch {
    return null;
  }
};