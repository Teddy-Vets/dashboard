import { getCurrentUser, getUserClinicId, isAdmin, safeApiCall } from '@/components/utils/apiHelpers';

/**
 * שירות ניהול משתמשים
 */
class UserService {
  constructor() {
    this._currentUser = null;
    this._userPromise = null;
  }

  /**
   * קבלת פרטי המשתמש הנוכחי (עם קאשינג)
   */
  async getCurrentUser() {
    if (this._currentUser) {
      return this._currentUser;
    }

    if (this._userPromise) {
      return this._userPromise;
    }

    this._userPromise = this._loadUser();
    
    try {
      this._currentUser = await this._userPromise;
      return this._currentUser;
    } catch (error) {
      this._userPromise = null;
      // אם המשתמש לא מחובר, נחזיר null במקום לזרוק שגיאה
      if (error?.status === 401) {
        return null;
      }
      throw error;
    } finally {
      this._userPromise = null;
    }
  }

  async _loadUser() {
    try {
      const { User } = await import('@/entities/User');
      const user = await User.me();
      return user;
    } catch (error) {
      // אם זו שגיאת 401 (לא מחובר), נחזיר null
      if (error?.status === 401 || error?.message?.includes('Unauthorized')) {
        console.log('[userService] User not authenticated');
        return null;
      }
      // אם זו שגיאת רשת כללית, נזרוק אותה
      console.error('[userService] Error loading user:', error);
      throw error;
    }
  }

  /**
   * ביטול קאש המשתמש (לדוגמה, לאחר התנתקות)
   */
  clearUserCache() {
    this._currentUser = null;
    this._userPromise = null;
  }

  /**
   * בדיקה האם המשתמש הנוכחי הוא אדמין
   */
  async isAdmin() {
    try {
      const user = await this.getCurrentUser();
      return user?.role === 'admin';
    } catch {
      return false;
    }
  }

  /**
   * קבלת clinic_id של המשתמש הנוכחי
   */
  async getClinicId() {
    try {
      const user = await this.getCurrentUser();
      return user?.clinic_id || null;
    } catch {
      return null;
    }
  }

  /**
   * התנתקות
   */
  async logout() {
    try {
      const { User } = await import('@/entities/User');
      await User.logout();
      this.clearUserCache();
    } catch (error) {
      console.error('[userService] Error during logout:', error);
      // גם אם יש שגיאה, ננקה את הקאש
      this.clearUserCache();
      throw error;
    }
  }

  /**
   * התחברות עם redirect
   */
  async loginWithRedirect(callbackUrl) {
    const { User } = await import('@/entities/User');
    return User.loginWithRedirect(callbackUrl);
  }
}

// יצירת instance יחיד של השירות
export const userService = new UserService();
export default userService;