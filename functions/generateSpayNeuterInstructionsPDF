
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { jsPDF } from 'npm:jspdf@2.5.1';
import { hebrewFont } from './helpers/pdfHelpers.js';

// פונקציות עזר לעבודה עם PDF בעברית
function setupHebrewFont(doc) {
    try {
        doc.setFont('helvetica');
        doc.setLanguage('he');
        return doc;
    } catch (error) {
        console.error('Error setting up Hebrew font:', error);
        return doc;
    }
}

function writeHebrewText(doc, text, x, y, options = {}) {
    const { fontSize = 12, align = 'right', maxWidth = null, lineHeight = 7 } = options;
    doc.setFontSize(fontSize);
    if (!text) return y;
    
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

function writeSection(doc, title, content, y, pageWidth) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    y = writeHebrewText(doc, title, pageWidth - 20, y, { fontSize: 12, align: 'right' });
    y += 2;
    
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

function checkPageBreak(doc, currentY, marginBottom = 30) {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (currentY > pageHeight - marginBottom) {
        doc.addPage();
        return 20;
    }
    return currentY;
}

function formatHebrewDate(dateString) {
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

function createPageHeader(doc, clinicName, pageTitle) {
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.text(pageTitle, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(clinicName || 'מרפאות טדי וטס', pageWidth / 2, 28, { align: 'center' });
    
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.8);
    doc.line(20, 32, pageWidth - 20, 32);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    return 40;
}

function createPageFooter(doc, pageNumber, totalPages) {
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

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { instruction_id } = await req.json();

        if (!instruction_id) {
            return Response.json({ error: 'Missing instruction_id' }, { status: 400 });
        }

        const instructions = await base44.entities.SpayNeuterInstructions.filter({ id: instruction_id });
        const instruction = instructions[0];

        if (!instruction) {
            return Response.json({ error: 'Instructions not found' }, { status: 404 });
        }

        let clinicName = 'מרפאות טדי וטס';
        let clinicContact = '';
        if (instruction.clinic_id) {
            try {
                const clinics = await base44.entities.Clinic.filter({ id: instruction.clinic_id });
                if (clinics.length > 0) {
                    clinicName = clinics[0].name;
                    clinicContact = `${clinics[0].phone || ''} | ${clinics[0].email || ''}`;
                }
            } catch (e) {
                console.warn('Could not load clinic details:', e);
            }
        }

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        setupHebrewFont(doc);

        const pageWidth = doc.internal.pageSize.getWidth();
        let y = createPageHeader(doc, clinicName, 'הנחיות עיקור/סירוס');

        y = checkPageBreak(doc, y);
        y = writeSection(doc, 'שם הבעלים:', instruction.owner_name || 'לא צוין', y, pageWidth);
        y = writeSection(doc, 'שם חיית המחמד:', instruction.pet_name || 'לא צוין', y, pageWidth);
        y = writeSection(doc, 'תאריך הניתוח:', formatHebrewDate(instruction.surgery_date), y, pageWidth);
        y = writeSection(doc, 'סוג הניתוח:', instruction.surgery_type || 'לא צוין', y, pageWidth);

        y += 5;

        if (instruction.post_op_rest_instructions) {
            y = checkPageBreak(doc, y);
            y = writeSection(doc, 'הנחיות למנוחה לאחר הניתוח:', instruction.post_op_rest_instructions, y, pageWidth);
        }

        if (instruction.fasting_until_hour) {
            y = checkPageBreak(doc, y);
            y = writeSection(doc, 'צום עד השעה:', instruction.fasting_until_hour, y, pageWidth);
        }

        if (instruction.feeding_instructions) {
            y = checkPageBreak(doc, y);
            y = writeSection(doc, 'הנחיות האכלה:', instruction.feeding_instructions, y, pageWidth);
        }

        if (instruction.medication_instructions_general) {
            y = checkPageBreak(doc, y);
            y = writeSection(doc, 'הנחיות כלליות לתרופות:', instruction.medication_instructions_general, y, pageWidth);
        }

        if (instruction.antibiotic_name) {
            y = checkPageBreak(doc, y);
            const antibioticText = `${instruction.antibiotic_name}${instruction.antibiotic_dosage ? ' - מינון: ' + instruction.antibiotic_dosage : ''}${instruction.antibiotic_frequency ? ' - תדירות: ' + instruction.antibiotic_frequency : ''}`;
            y = writeSection(doc, 'אנטיביוטיקה:', antibioticText, y, pageWidth);
        }

        if (instruction.pain_medication_name) {
            y = checkPageBreak(doc, y);
            const painMedText = `${instruction.pain_medication_name}${instruction.pain_medication_dosage ? ' - מינון: ' + instruction.pain_medication_dosage : ''}${instruction.pain_medication_frequency ? ' - תדירות: ' + instruction.pain_medication_frequency : ''}`;
            y = writeSection(doc, 'משכך כאבים:', painMedText, y, pageWidth);
        }

        if (instruction.local_wound_care_instructions) {
            y = checkPageBreak(doc, y);
            y = writeSection(doc, 'טיפול מקומי בפצע:', instruction.local_wound_care_instructions, y, pageWidth);
        }

        if (instruction.post_op_expectations) {
            y = checkPageBreak(doc, y);
            y = writeSection(doc, 'ציפיות לאחר הניתוח:', instruction.post_op_expectations, y, pageWidth);
        }

        if (instruction.followup_date) {
            y = checkPageBreak(doc, y);
            y = writeSection(doc, 'תאריך ביקורת:', formatHebrewDate(instruction.followup_date), y, pageWidth);
        }

        if (instruction.veterinarian_name) {
            y = checkPageBreak(doc, y);
            y = writeSection(doc, 'וטרינר מטפל:', instruction.veterinarian_name, y, pageWidth);
        }

        if (instruction.clinic_contact_info || clinicContact) {
            y = checkPageBreak(doc, y);
            y = writeSection(doc, 'פרטי יצירת קשר:', instruction.clinic_contact_info || clinicContact, y, pageWidth);
        }

        if (instruction.emergency_contacts && instruction.emergency_contacts.length > 0) {
            y = checkPageBreak(doc, y);
            y += 3;
            doc.setFont('helvetica', 'bold');
            y = writeHebrewText(doc, 'אנשי קשר חירום 24/7:', pageWidth - 20, y, { fontSize: 12, align: 'right' });
            doc.setFont('helvetica', 'normal');
            
            instruction.emergency_contacts.forEach(contact => {
                y = checkPageBreak(doc, y);
                const contactText = `${contact.name || ''} - ${contact.phone || ''} ${contact.address ? '(' + contact.address + ')' : ''}`;
                y = writeHebrewText(doc, contactText, pageWidth - 20, y + 4, { fontSize: 10, align: 'right' });
            });
        }

        createPageFooter(doc, 1, 1);

        const pdfBytes = doc.output('arraybuffer');

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=spay-neuter-instructions-${instruction.pet_name || 'pet'}.pdf`
            }
        });

    } catch (error) {
        console.error('[generateSpayNeuterInstructionsPDF] Error:', error);
        return Response.json({
            error: 'Failed to generate PDF',
            details: error.message
        }, { status: 500 });
    }
});
