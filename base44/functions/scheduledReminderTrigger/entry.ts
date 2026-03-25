import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// פונקציה זו תיקרא על ידי מערכת תזמון חיצונית (Cron) כל שעה
Deno.serve(async (req) => {
    try {
        // וידוא שזה קריאה מורשית מהמערכת
        const cronSecret = Deno.env.get('CRON_SECRET');
        const providedSecret = req.headers.get('x-cron-secret') || new URL(req.url).searchParams.get('secret');
        
        if (!cronSecret || cronSecret !== providedSecret) {
            return Response.json({ error: 'Unauthorized - invalid CRON secret' }, { status: 401 });
        }

        console.log('[scheduledReminderTrigger] Starting scheduled reminder check...');

        // קריאה לפונקציית התזכורות
        const reminderResponse = await fetch(`${req.url.split('/scheduledReminderTrigger')[0]}/sendAppointmentReminders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-cron-secret': cronSecret
            },
            body: JSON.stringify({})
        });

        const reminderResult = await reminderResponse.json();
        
        console.log('[scheduledReminderTrigger] Reminder result:', reminderResult);

        return Response.json({
            success: true,
            timestamp: new Date().toISOString(),
            reminder_result: reminderResult
        });

    } catch (error) {
        console.error('[scheduledReminderTrigger] Error:', error);
        return Response.json({
            success: false,
            error: 'שגיאה בהפעלת תזכורות מתוזמנות',
            details: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
});