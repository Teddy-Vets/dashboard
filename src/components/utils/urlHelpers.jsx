/**
 * URL Helpers - בניית קישורים ציבוריים ופנימיים
 */

/**
 * בניית URL ציבורי מלא (עבור שיתוף בווטסאפ/מייל)
 */
export const buildPublicFormUrl = (formType, params = {}) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  
  let path;
  switch (formType) {
    case 'intake':
    case 'PublicForm':
      path = `/PublicForm`;
      break;
    case 'consent':
    case 'PublicConsentForm':
      path = `/PublicConsentForm`;
      break;
    case 'view-intake':
    case 'PublicViewIntakeForm':
      path = `/PublicViewIntakeForm`;
      break;
    default:
      console.error(`Unknown form type: ${formType}`);
      throw new Error(`Unknown form type: ${formType}`);
  }
  
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });
  
  const queryString = queryParams.toString();
  const fullUrl = `${origin}${path}${queryString ? `?${queryString}` : ''}`;
  
  return fullUrl;
};

/**
 * פונקציה ליצירת URL לדף (תאימות לאחור) - תיקון לניווט
 */
export const createPageUrl = (pageName, params = {}) => {
  if (params && Object.keys(params).length > 0) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    return `/${pageName}?${queryParams.toString()}`;
  }
  return `/${pageName}`;
};

/**
 * פונקציית גיבוי להעתקה ללוח עבור דפדפנים ישנים או הקשרים לא מאובטחים
 */
const fallbackCopyToClipboard = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.width = '2em';
  textArea.style.height = '2em';
  textArea.style.padding = '0';
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';
  textArea.style.background = 'transparent';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (!successful) {
        throw new Error('Fallback copy was unsuccessful');
    }
  } catch (err) {
      console.warn('Fallback copy failed silently', err);
  }

  document.body.removeChild(textArea);
};

/**
 * העתקת טקסט ללוח - עובד בשקט ללא הודעות שגיאה למשתמש
 */
export const copyToClipboard = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (err) {
      console.warn("navigator.clipboard.writeText failed silently, trying fallback.", err);
    }
  }
  
  try {
    fallbackCopyToClipboard(text);
  } catch (err) {
    console.warn("All copy methods failed silently.", err);
  }
};

/**
 * פתיחת שיתוף בווטסאפ
 */
export const shareViaWhatsApp = (url, message = '') => {
  const text = message ? message : url;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}\n\n${encodeURIComponent(url)}`;
  window.open(whatsappUrl, '_blank');
};

/**
 * פתיחת שיתוף במייל
 */
export const shareViaEmail = (url, subject = '', body = '') => {
  const emailBody = body ? `${body}\n\n${url}` : url;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
  window.location.href = mailtoUrl;
};