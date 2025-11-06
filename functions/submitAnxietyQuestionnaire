import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const formData = await req.json();

        console.log('[submitAnxietyQuestionnaire] Received form data:', JSON.stringify(formData, null, 2));

        if (!formData.id) {
            console.error('[submitAnxietyQuestionnaire] Missing form ID');
            return Response.json({
                success: false,
                error: 'מזהה השאלון חסר'
            }, { status: 400 });
        }

        // עדכון השאלון לסטטוס completed
        const updatedQuestionnaire = await base44.asServiceRole.entities.AnxietyQuestionnaire.update(formData.id, {
            ...formData,
            status: 'completed',
            completed_at: new Date().toISOString()
        });

        console.log('[submitAnxietyQuestionnaire] Updated questionnaire:', updatedQuestionnaire.id);

        return Response.json({
            success: true,
            message: 'שאלון החרדה נשלח בהצלחה',
            questionnaireId: updatedQuestionnaire.id
        });

    } catch (error) {
        console.error('[submitAnxietyQuestionnaire] Error:', error);
        
        let errorMessage = 'שגיאה בשליחת השאלון';
        
        if (error.message?.includes('not found')) {
            errorMessage = 'השאלון לא נמצא במערכת';
        } else if (error.message?.includes('permission')) {
            errorMessage = 'אין הרשאה לבצע פעולה זו';
        } else if (error.message?.includes('validation')) {
            errorMessage = 'שגיאה באימות הנתונים';
        }
        
        return Response.json({
            success: false,
            error: errorMessage,
            details: error.message
        }, { status: 500 });
    }
});