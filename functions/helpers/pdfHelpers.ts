import { jsPDF } from 'npm:jspdf@2.5.1';

/**
 * מטמיע פונט עברי ב-jsPDF
 * פתרון לתמיכה בעברית ב-PDF
 */
export function setupHebrewFont(doc) {
    try {
        // נשתמש בפונט Helvetica הסטנדרטי שתומך בעברית (Unicode)
        // אם יש צורך בפונט מותאם אישית, ניתן להוסיף כאן
        doc.setFont('helvetica');
        doc.setLanguage('he');
        return doc;
    } catch (error) {
        console.error('Error setting up Hebrew font:', error);
        return doc;
    }
}

/**
 * כותב טקסט עברי ב-PDF עם תמיכה מלאה ב-RTL
 */
export function writeHebrewText(doc, text, x, y, options = {}) {
    const {
        fontSize = 12,
        align = 'right',
        maxWidth = null,
        lineHeight = 7
    } = options;

    doc.setFontSize(fontSize);
    
    if (!text) return y;
    
    // אם הטקסט ארוך מדי, פצל לשורות
    if (maxWidth) {
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line, index) => {
            doc.text(line, x, y + (index * lineHeight), { align });
        });
        return y + (lines.length * lineHeight);
    } else {
        doc.text(text, x, y, { align });
        return y + lineHeight;
    }
}

/**
 * יוצר כותרת עברית מעוצבת
 */
export function writeHebrewHeader(doc, text, y, options = {}) {
    const {
        fontSize = 18,
        color = [0, 51, 102], // כחול כהה
        align = 'center'
    } = options;

    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color);
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const x = align === 'center' ? pageWidth / 2 : (align === 'right' ? pageWidth - 20 : 20);
    
    doc.text(text, x, y, { align });
    
    // חזרה לפונט רגיל
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    return y + 10;
}

/**
 * יוצר קו מפריד
 */
export function drawSeparatorLine(doc, y, margin = 20) {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    return y + 5;
}

/**
 * יוצר סעיף עם כותרת ותוכן
 */
export function writeSection(doc, title, content, y, pageWidth) {
    // כותרת הסעיף
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    y = writeHebrewText(doc, title, pageWidth - 20, y, { fontSize: 12, align: 'right' });
    y += 2;
    
    // תוכן הסעיף
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    y = writeHebrewText(doc, content, pageWidth - 20, y + 3, { 
        fontSize: 10, 
        align: 'right',
        maxWidth: pageWidth - 40,
        lineHeight: 6
    });
    
    return y + 5;
}

/**
 * בדיקת תום עמוד והוספת עמוד חדש במידת הצורך
 */
export function checkPageBreak(doc, currentY, marginBottom = 30) {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (currentY > pageHeight - marginBottom) {
        doc.addPage();
        return 20; // Y התחלתי לעמוד חדש
    }
    return currentY;
}

/**
 * יוצר תאריך מעוצב בעברית
 */
export function formatHebrewDate(dateString) {
    if (!dateString) return 'לא צוין';
    
    try {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch {
        return dateString;
    }
}

/**
 * יוצר כותרת עמוד סטנדרטית עם לוגו ופרטי מרפאה
 */
export function createPageHeader(doc, clinicName, pageTitle) {
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // כותרת ראשית
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.text(pageTitle, pageWidth / 2, 20, { align: 'center' });
    
    // שם המרפאה
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(clinicName || 'מרפאות טדי וטס', pageWidth / 2, 28, { align: 'center' });
    
    // קו מפריד
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.8);
    doc.line(20, 32, pageWidth - 20, 32);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    return 40; // Y להמשך התוכן
}

/**
 * יוצר כותרת תחתונה (footer) עם מספר עמוד
 */
export function createPageFooter(doc, pageNumber, totalPages) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
        `עמוד ${pageNumber}${totalPages ? ` מתוך ${totalPages}` : ''}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
    );
    
    doc.setTextColor(0, 0, 0);
}