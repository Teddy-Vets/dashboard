import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { jsPDF } from 'npm:jspdf@2.5.1';

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

        const { questionnaire_id } = await req.json();

        if (!questionnaire_id) {
            return Response.json({ error: 'Missing questionnaire_id' }, { status: 400 });
        }

        const questionnaires = await base44.entities.AnxietyQuestionnaire.filter({ id: questionnaire_id });
        const questionnaire = questionnaires[0];

        if (!questionnaire) {
            return Response.json({ error: 'Questionnaire not found' }, { status: 404 });
        }

        let clinicName = 'מרפאות טדי וטס';
        if (questionnaire.clinic_id) {
            try {
                const clinics = await base44.entities.Clinic.filter({ id: questionnaire.clinic_id });
                if (clinics.length > 0) {
                    clinicName = clinics[0].name;
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
        let y = createPageHeader(doc, clinicName, 'שאלון חרדה וטרינרית');

        y = checkPageBreak(doc, y);
        y = writeSection(doc, 'שם הבעלים:', questionnaire.owner_name || 'לא צוין', y, pageWidth);
        y = writeSection(doc, 'שם חיית המחמד:', questionnaire.pet_name || 'לא צוין', y, pageWidth);
        y = writeSection(doc, 'סוג חיית המחמד:', questionnaire.pet_type || 'לא צוין', y, pageWidth);
        y = writeSection(doc, 'תאריך מילוי:', formatHebrewDate(questionnaire.completed_at || questionnaire.created_date), y, pageWidth);

        y += 5;

        if (questionnaire.q1_home_reaction) {
            y = checkPageBreak(doc, y);
            y = writeSection(doc, 'שאלה 1: תגובה בבית לנסיעה לווטרינר', questionnaire.q1_home_reaction, y, pageWidth);
            
            if (questionnaire.qa1_coping_methods && questionnaire.qa1_coping_methods.length > 0) {
                const methods = Array.isArray(questionnaire.qa1_coping_methods) 
                    ? questionnaire.qa1_coping_methods.join(', ') 
                    : questionnaire.qa1_coping_methods;
                y = writeSection(doc, 'שיטות התמודדות:', methods, y, pageWidth);
            }
            
            if (questionnaire.qa1_other_method) {
                y = writeSection(doc, 'שיטה אחרת:', questionnaire.qa1_other_method, y, pageWidth);
            }
        }

        if (questionnaire.q2_travel_behavior) {
            y = checkPageBreak(doc, y);
            y = writeSection(doc, 'שאלה 2: התנהגות בדרך למרפאה', questionnaire.q2_travel_behavior, y, pageWidth);
        }

        if (questionnaire.q3_clinic_entrance) {
            y = checkPageBreak(doc, y);
            y = writeSection(doc, 'שאלה 3: התנהגות בכניסה למרפאה', questionnaire.q3_clinic_entrance, y, pageWidth);
            
            if (questionnaire.qa3_clinic_help && questionnaire.qa3_clinic_help.length > 0) {
                const help = Array.isArray(questionnaire.qa3_clinic_help) 
                    ? questionnaire.qa3_clinic_help.join(', ') 
                    : questionnaire.qa3_clinic_help;
                y = writeSection(doc, 'מה יכול לעזור:', help, y, pageWidth);
            }
            
            if (questionnaire.qa3_other_help) {
                y = writeSection(doc, 'עזרה אחרת:', questionnaire.qa3_other_help, y, pageWidth);
            }
        }

        if (questionnaire.q4_examination_reaction) {
            y = checkPageBreak(doc, y);
            y = writeSection(doc, 'שאלה 4: תגובה במהלך בדיקה', questionnaire.q4_examination_reaction, y, pageWidth);
        }

        if (questionnaire.q5_owner_hesitation) {
            y = checkPageBreak(doc, y);
            y = writeSection(doc, 'שאלה 5: חשש להביא לבדיקה', questionnaire.q5_owner_hesitation, y, pageWidth);
            
            if (questionnaire.qa5_owner_comfort && questionnaire.qa5_owner_comfort.length > 0) {
                const comfort = Array.isArray(questionnaire.qa5_owner_comfort) 
                    ? questionnaire.qa5_owner_comfort.join(', ') 
                    : questionnaire.qa5_owner_comfort;
                y = writeSection(doc, 'מה יעזור לבעלים:', comfort, y, pageWidth);
            }
            
            if (questionnaire.qa5_other_comfort) {
                y = writeSection(doc, 'נוחות אחרת:', questionnaire.qa5_other_comfort, y, pageWidth);
            }
        }

        if (questionnaire.q6_improvement_suggestions) {
            y = checkPageBreak(doc, y);
            y = writeSection(doc, 'שאלה 6: הצעות לשיפור:', questionnaire.q6_improvement_suggestions, y, pageWidth);
        }

        if (questionnaire.q7_difficult_treatments) {
            y = checkPageBreak(doc, y);
            y = writeSection(doc, 'שאלה 7: טיפולים קשים:', questionnaire.q7_difficult_treatments, y, pageWidth);
            
            if (questionnaire.q7_difficult_treatments_details) {
                y = writeSection(doc, 'פרטים:', questionnaire.q7_difficult_treatments_details, y, pageWidth);
            }
        }

        if (questionnaire.q8_owner_feelings) {
            y = checkPageBreak(doc, y);
            y = writeSection(doc, 'שאלה 8: תחושת הבעלים בביקור:', questionnaire.q8_owner_feelings, y, pageWidth);
            
            if (questionnaire.qa8_owner_relaxation && questionnaire.qa8_owner_relaxation.length > 0) {
                const relaxation = Array.isArray(questionnaire.qa8_owner_relaxation) 
                    ? questionnaire.qa8_owner_relaxation.join(', ') 
                    : questionnaire.qa8_owner_relaxation;
                y = writeSection(doc, 'מה יעזור לרגיעה:', relaxation, y, pageWidth);
            }
            
            if (questionnaire.qa8_other_relaxation) {
                y = writeSection(doc, 'רגיעה אחרת:', questionnaire.qa8_other_relaxation, y, pageWidth);
            }
        }

        if (questionnaire.q9_victory_visits) {
            y = checkPageBreak(doc, y);
            y = writeSection(doc, 'שאלה 9: עניין ב-Victory Visits:', questionnaire.q9_victory_visits, y, pageWidth);
        }

        if (questionnaire.anxiety_score) {
            y = checkPageBreak(doc, y);
            y += 5;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(204, 0, 0);
            y = writeHebrewText(doc, `ציון חרדה: ${questionnaire.anxiety_score}/10`, pageWidth - 20, y, { fontSize: 14, align: 'right' });
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
        }

        if (questionnaire.recommendations) {
            y = checkPageBreak(doc, y);
            y += 5;
            y = writeSection(doc, 'המלצות צוות המרפאה:', questionnaire.recommendations, y, pageWidth);
        }

        createPageFooter(doc, 1, 1);

        const pdfBytes = doc.output('arraybuffer');

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=anxiety-questionnaire-${questionnaire.pet_name || 'pet'}.pdf`
            }
        });

    } catch (error) {
        console.error('[generateAnxietyQuestionnairePDF] Error:', error);
        return Response.json({
            error: 'Failed to generate PDF',
            details: error.message
        }, { status: 500 });
    }
});