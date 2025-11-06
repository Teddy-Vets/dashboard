
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // וידוא הרשאה - רק מערכת או אדמין יכול לקרוא לזה
        const cronSecret = Deno.env.get('CRON_SECRET');
        const providedSecret = req.headers.get('x-cron-secret');
        
        if (!cronSecret || cronSecret !== providedSecret) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[sendAppointmentReminders] Starting reminder check...');

        const now = new Date();
        
        // חישוב זמנים לתזכורות
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dayAfterTomorrow = new Date(now);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        
        const in2Hours = new Date(now);
        in2Hours.setHours(in2Hours.getHours() + 2);
        
        const in3Hours = new Date(now);
        in3Hours.setHours(in3Hours.getHours() + 3);

        // חיפוש תורים שזקוקים לתזכורת 24-48 שעות
        const upcomingAppointments = await base44.asServiceRole.entities.AppointmentRequest.filter({
            status: 'confirmed',
            reminder_24h_sent: { $ne: true }, // מניעת כפילות - רק אם לא נשלח
            preferred_date: {
                $gte: tomorrow.toISOString().split('T')[0],
                $lte: dayAfterTomorrow.toISOString().split('T')[0]
            }
        });

        // חיפוש תורים שזקוקים לתזכורת 2 שעות
        const soonAppointments = await base44.asServiceRole.entities.AppointmentRequest.filter({
            status: 'confirmed',
            reminder_2h_sent: { $ne: true }, // מניעת כפילות - רק אם לא נשלח
            appointment_datetime: {
                $gte: in2Hours.toISOString(),
                $lt: in3Hours.toISOString()
            }
        });

        let sentReminders = [];

        // שליחת תזכורות 24-48 שעות לפני
        for (const appointment of upcomingAppointments) {
            try {
                // בדיקה כפולה למקרה של race condition
                if (appointment.reminder_24h_sent) continue;

                const reminderContent = await buildReminderContent(appointment, '24h');
                
                // שליחת מייל דרך הפונקציה המרכזית
                await base44.asServiceRole.functions.invoke('sendEmailWithSendGrid', {
                    to: appointment.owner_email,
                    subject: reminderContent.subject,
                    body: reminderContent.body,
                    from_name: 'טדי וטס - מרפאה וטרינרית',
                    clinic_id: appointment.clinic_id // העברת מזהה המרפאה
                });

                // סימון שהתזכורת נשלחה
                await base44.asServiceRole.entities.AppointmentRequest.update(appointment.id, {
                    reminder_24h_sent: true,
                    reminder_24h_sent_at: now.toISOString()
                });

                sentReminders.push({
                    type: '24h',
                    appointment_id: appointment.id,
                    owner_name: appointment.owner_name,
                    pet_name: appointment.pet_name
                });

            } catch (error) {
                console.error(`[sendAppointmentReminders] Error sending 24h reminder for appointment ${appointment.id}:`, error);
            }
        }

        // שליחת תזכורות 2 שעות לפני
        for (const appointment of soonAppointments) {
            try {
                // בדיקה כפולה למקרה של race condition
                if (appointment.reminder_2h_sent) continue;

                const reminderContent = await buildReminderContent(appointment, '2h');
                
                // שליחת מייל דרך הפונקציה המרכזית
                await base44.asServiceRole.functions.invoke('sendEmailWithSendGrid', {
                    to: appointment.owner_email,
                    subject: reminderContent.subject,
                    body: reminderContent.body,
                    from_name: 'טדי וטס - מרפאה וטרינרית',
                    clinic_id: appointment.clinic_id // העברת מזהה המרפאה
                });

                // סימון שהתזכורת נשלחה
                await base44.asServiceRole.entities.AppointmentRequest.update(appointment.id, {
                    reminder_2h_sent: true,
                    reminder_2h_sent_at: now.toISOString()
                });

                sentReminders.push({
                    type: '2h',
                    appointment_id: appointment.id,
                    owner_name: appointment.owner_name,
                    pet_name: appointment.pet_name
                });

            } catch (error) {
                console.error(`[sendAppointmentReminders] Error sending 2h reminder for appointment ${appointment.id}:`, error);
            }
        }

        console.log(`[sendAppointmentReminders] Sent ${sentReminders.length} reminders`);
        
        return Response.json({
            success: true,
            sent_reminders: sentReminders,
            total_sent: sentReminders.length
        });

    } catch (error) {
        console.error('[sendAppointmentReminders] Error:', error);
        return Response.json({
            success: false,
            error: 'שגיאה בשליחת תזכורות',
            details: error.message
        }, { status: 500 });
    }
});

// פונקציה לבניית תוכן התזכורת
async function buildReminderContent(appointment, reminderType) {
    const { owner_name, pet_name, request_type, preferred_date, preferred_time, clinic_id } = appointment;
    
    // טעינת פרטי המרפאה
    const base44 = createClientFromRequest();
    let clinicInfo = null;
    try {
        const clinics = await base44.asServiceRole.entities.Clinic.filter({ id: clinic_id });
        clinicInfo = clinics[0];
    } catch (error) {
        console.warn('Could not load clinic info:', error);
    }

    const clinicName = clinicInfo?.name || 'מרפאות טדי וטס';
    const clinicAddress = clinicInfo?.address || 'כתובת המרפאה';
    const clinicPhone = clinicInfo?.phone || 'טלפון המרפאה';

    if (reminderType === '24h') {
        return {
            subject: `🔔 תזכורת: התור של ${pet_name} מחר ב-${clinicName}`,
            body: `שלום ${owner_name},

זוהי תזכורת ידידותית לתור שלכם מחר! 📅

🐾 **פרטי התור:**
• חיית מחמד: ${pet_name}
• תאריך: ${preferred_date}
• שעה: ${preferred_time}
• סוג ביקור: ${request_type === 'vaccination' ? 'חיסון' : 'ביקור רפואי'}

📍 **פרטי המרפאה:**
• שם: ${clinicName}
• כתובת: ${clinicAddress}
• טלפון: ${clinicPhone}

💡 **תזכורות חשובות:**
• הגיעו 10 דקות לפני השעה שנקבעה
${request_type === 'vaccination' ? '• הביאו את פנקס החיסונים (אם יש)' : '• הביאו תיעוד רפואי קודם (אם יש)'}
• אם יש צורך לבטל או לדחות - אנא צרו קשר מוקדם ככל האפשר

❓ **יש שאלות?** צרו קשר בטלפון המרפאה או בוואטסאפ.

מחכים לראות אתכם ואת ${pet_name} מחר! 🏥`
        };
    } else if (reminderType === '2h') {
        return {
            subject: `⏰ התור של ${pet_name} תוך שעתיים - ${clinicName}`,
            body: `שלום ${owner_name},

התור שלכם עם ${pet_name} מתחיל תוך שעתיים! ⏰

🐾 **פרטי התור:**
• שעה: ${preferred_time}
• כתובת: ${clinicAddress}

🚗 **הכנות אחרונות:**
• כדאי לצאת עכשיו לדרך (להגיע 10 דקות לפני)
• וודאו שיש לכם את כל המסמכים הנדרשים
• אם נתקעתם בדרך - התקשרו אלינו בטלפון ${clinicPhone}

🙏 **אם נבצר מכם להגיע** - אנא התקשרו אלינו מיד כדי לאפשר ללקוח אחר לקבל את התור.

מחכים לכם בקרוב!`
        };
    }
}
