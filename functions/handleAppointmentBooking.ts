import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const appointmentData = await req.json();

        console.log('[handleAppointmentBooking] Processing appointment:', appointmentData.id);

        // טעינת פרטי המרפאה (כולל מייל)
        let clinicInfo = null;
        if (appointmentData.clinic_id) {
            try {
                const clinics = await base44.asServiceRole.entities.Clinic.filter({ id: appointmentData.clinic_id });
                clinicInfo = clinics?.[0];
                console.log('[handleAppointmentBooking] Clinic loaded:', clinicInfo?.name);
            } catch (error) {
                console.warn('[handleAppointmentBooking] Could not load clinic info:', error);
            }
        }

        // פונקציה לבחירת תוכן מותאם אישית
        const getCustomizedContent = (appointmentData) => {
            const { request_type, pet_type, customer_type, owner_name, pet_name } = appointmentData;
            
            // תכנים בסיסיים לכל סוגי השירותים
            const baseContent = {
                greeting: `שלום ${owner_name},\n\nברוכים הבאים למשפחת מרפאות טדי וטס! 🎉`,
                signature: `\nבברכה,\nצוות מרפאות טדי וטס\nרפואה וטרינרית בוטיק ברמה`
            };

            let customSubject = '';
            let customContent = '';
            let whatsappMessage = '';
            
            // התאמה לפי סוג השירות
            if (request_type === 'vaccination') {
                customSubject = `📅 זימון לחיסון ${pet_name} - מידע חשוב על החיסון`;
                
                customContent = `${baseContent.greeting}

אנחנו מתרגשים לקבל אתכם ואת ${pet_name} לחיסון במרפאה שלנו! 💉

🛡️ **מידע חשוב על החיסון:**
• החיסון מגן על ${pet_name} מפני מחלות מסוכנות ופוטנציאליות קטלניות
• התהליך קצר ובטוח - בדרך כלל לוקח כ-15 דקות
• ${pet_name === pet_name.toLowerCase() ? pet_name : pet_name} עלול/ה להרגיש קצת עייף/ה ביום הראשון - זה נורמלי לחלוטין

🎯 **הכנה לחיסון:**
• הביאו את פנקס החיסונים הקודם (אם יש)
• וודאו ש-${pet_name} בבריאות טובה ביום החיסון
• אם יש לכם שאלות על החיסון - נענה עליהן במרפאה

${pet_type === 'גור' || pet_type?.includes('גור') ? 
`🐕 **טיפים לגור:**
• זהו חיסון חשוב במיוחד לגורים צעירים
• לאחר החיסון, המתינו 10-14 יום לפני יציאה לטיולים ברחוב
• שמרו על ${pet_name} במקום חמים ונוח לאחר החיסון` : ''}`;

                whatsappMessage = `שלום ${owner_name}! 👋

קיבלנו את בקשתכם לחיסון עבור ${pet_name} 💉

📋 אנא מלאו את טופס ההיכרות לפני הביקור - זה יעזור לנו לתת את השירות הטוב ביותר!

💡 זכרו: הביאו פנקס חיסונים קודם אם יש לכם.`;

            } else if (request_type === 'medical_visit') {
                customSubject = `🏥 זימון לביקור רפואי ${pet_name} - הכנה לביקור`;
                
                customContent = `${baseContent.greeting}

קיבלנו את בקשתכם לביקור רפואי עבור ${pet_name}. אנחנו כאן לעזור! 🏥

🩺 **הכנה לביקור הרפואי:**
• רשמו את כל הסימפטומים שזיהיתם ב-${pet_name}
• הכינו רשימה של התרופות ש-${pet_name} לוקח/ת כרגע (אם יש)
• הביאו כל תיעוד רפואי קודם שיש ברשותכם

📝 **מידע שיעזור לנו לעזור לכם:**
• מתי הסימפטומים החלו?
• האם יש שינוי בתיאבון או בהתנהגות?
• האם ${pet_name} נחשף/ה למשהו חדש לאחרונה?

${pet_type === 'חתול' ? 
`🐱 **טיפ לבעלי חתולים:**
• הביאו את ${pet_name} בקרייר נוח ומאוורר
• חתולים יכולים להיות מתוחים ברכב - נסיכה קצרה לפני היציאה תעזור` : 
pet_type === 'כלב' ?
`🐕 **טיפ לבעלי כלבים:**
• הביאו רצועה איכותית ונוחה
• אם ${pet_name} לא אוהב/ת זרים, הזכירו לנו בהגעה` : ''}`;

                whatsappMessage = `שלום ${owner_name}! 👋

קיבלנו את בקשתכם לביקור רפואי עבור ${pet_name} 🏥

📋 חשוב: אנא מלאו את טופס ההיכרות וכתבו בפירוט על הסימפטומים שזיהיתם.

💡 הכנה לביקור: הביאו תיעוד רפואי קודם אם יש לכם.`;
            }

            return {
                subject: customSubject,
                content: customContent,
                whatsapp: whatsappMessage,
                baseContent
            };
        };

        // פונקציית עזר לשליחת מייל באמצעות SendGrid
        const sendEmail = async (to, subject, body, clinicId, from_name = 'טדי וטס - מרפאה וטרינרית') => {
            try {
                const emailResult = await base44.asServiceRole.functions.invoke('sendEmailWithSendGrid', {
                    to, subject, body, from_name, clinic_id: clinicId
                });
                
                if (emailResult?.data?.success) {
                    console.log(`[handleAppointmentBooking] Email sent successfully to: ${to}`);
                    return true;
                } else {
                    console.warn(`[handleAppointmentBooking] Email sending failed:`, emailResult);
                    return false;
                }
            } catch (error) {
                console.error(`[handleAppointmentBooking] Email sending error:`, error);
                return false;
            }
        };

        // שליחת מייל למרפאה עם פרטי התור החדש
        if (clinicInfo?.email) {
            console.log('[handleAppointmentBooking] Sending notification to clinic:', clinicInfo.email);
            
            const clinicSubject = `🔔 בקשת תור חדשה - ${appointmentData.pet_name} (${appointmentData.owner_name})`;
            
            const clinicEmailBody = `שלום צוות ${clinicInfo.name},

קיבלתם בקשת תור חדשה במערכת! 📋

👤 **פרטי הבעלים:**
• שם: ${appointmentData.owner_name}
• טלפון: ${appointmentData.owner_phone}
${appointmentData.owner_email ? `• אימייל: ${appointmentData.owner_email}` : ''}

🐾 **פרטי חיית המחמד:**
• שם: ${appointmentData.pet_name}
${appointmentData.pet_type ? `• סוג: ${appointmentData.pet_type}` : ''}

📅 **פרטי התור:**
• סוג בקשה: ${appointmentData.request_type === 'vaccination' ? 'חיסון' : 'ביקור רפואי'}
${appointmentData.vaccination_types?.length > 0 ? `• סוגי חיסונים: ${appointmentData.vaccination_types.join(', ')}` : ''}
${appointmentData.medical_reason ? `• סיבת הביקור: ${appointmentData.medical_reason}` : ''}
• תאריך מועדף: ${appointmentData.preferred_date || 'לא צוין'}
• שעה מועדפת: ${appointmentData.preferred_time || 'לא צוינה'}
${appointmentData.customer_type === 'new' ? '\n🆕 **לקוח חדש** - יש לשלוח טופס היכרות' : ''}

${appointmentData.notes ? `📝 **הערות נוספות:**\n${appointmentData.notes}\n` : ''}

🔗 **לניהול התור:**
לחצו כאן לכניסה למערכת ניהול התורים: ${Deno.env.get('FRONTEND_URL')}/ManageAppointments

---
הודעה זו נשלחה אוטומטית ממערכת TeddyForms`;

            await sendEmail(
                clinicInfo.email,
                clinicSubject,
                clinicEmailBody,
                appointmentData.clinic_id,
                `מערכת תורים - ${clinicInfo.name}`
            );
        } else {
            console.warn('[handleAppointmentBooking] Clinic email not found, skipping clinic notification');
        }

        // אם זה לא לקוח חדש, נשלח הודעה מותאמת ללקוח חוזר
        if (appointmentData.customer_type !== 'new') {
            console.log('[handleAppointmentBooking] Returning customer - sending customized confirmation');
            
            const customized = getCustomizedContent(appointmentData);
            
            // הודעת אישור ללקוח חוזר
            const returningCustomerSubject = `✅ אישור תור - ${appointmentData.pet_name} במרפאת טדי וטס`;
            
            let returningCustomerEmail = `שלום ${appointmentData.owner_name},

תודה שבחרתם שוב במרפאות טדי וטס! 🙏

✅ **פרטי התור שלכם:**
📅 תאריך מועדף: ${appointmentData.preferred_date || 'יתואם בהמשך'}
🕐 שעה מועדפת: ${appointmentData.preferred_time || 'תתואם בהמשך'}
🐾 חיית מחמד: ${appointmentData.pet_name}
🏥 סוג ביקור: ${appointmentData.request_type === 'vaccination' ? 'חיסון' : 'ביקור רפואי'}

`;

            if (appointmentData.request_type === 'vaccination') {
                returningCustomerEmail += `💉 **זכרו לחיסון:**
• הביאו את פנקס החיסונים
• ${appointmentData.pet_name} עשוי/ה להיות עייף/ה ביום הראשון - זה נורמלי

`;
            } else if (appointmentData.request_type === 'medical_visit') {
                returningCustomerEmail += `🩺 **לביקור הרפואי:**
• הכינו רשימת הסימפטומים שזיהיתם
• הביאו תיעוד רפואי קודם אם יש

⚠️ **חשוב לדעת:**
התור עדיין לא נקבע באופן סופי. נציג מהמרפאה ייצור עמכם קשר טלפוני בהקדם כדי לאשר את המועד המדויק ולתאם את התאריך והשעה הסופיים.

`;
            }

            returningCustomerEmail += `יש שאלות? אנחנו כאן! 📞

${customized.baseContent.signature}`;

            // שליחת מייל ללקוח חוזר מיד
            if (appointmentData.owner_email) {
                await sendEmail(
                    appointmentData.owner_email,
                    returningCustomerSubject,
                    returningCustomerEmail,
                    appointmentData.clinic_id
                );
            }

            return Response.json({
                success: true,
                message: 'Returning customer - customized confirmation sent',
                customer_type: 'returning'
            });
        }

        // עבור לקוח חדש - נתחיל את מסע הלקוח המלא
        console.log('[handleAppointmentBooking] New customer detected - starting customized customer journey');

        // יצירת טופס היכרות חדש
        const intakeFormData = {
            clinic_id: appointmentData.clinic_id,
            owner_name: appointmentData.owner_name,
            owner_phone: appointmentData.owner_phone,
            owner_email: appointmentData.owner_email,
            pet_name: appointmentData.pet_name,
            pet_type: appointmentData.pet_type || 'כלב',
            status: 'draft',
            first_visit: 'yes',
            how_heard_about_us: 'אתר המרפאה - קביעת תור אונליין',
            visit_reason_main: appointmentData.request_type === 'vaccination' ? 'חיסון' : 
                              appointmentData.medical_reason || 'ביקור רפואי כללי'
        };

        const intakeForm = await base44.asServiceRole.entities.IntakeForm.create(intakeFormData);
        console.log('[handleAppointmentBooking] Created IntakeForm:', intakeForm.id);

        // יצירת קישור מאובטח לטופס ההיכרות
        const publicFormUrl = `${Deno.env.get('FRONTEND_URL') || 'https://your-app-url.com'}/PublicForm?id=${intakeForm.id}`;

        // קבלת תוכן מותאם אישית
        const customized = getCustomizedContent(appointmentData);

        // בניית המייל המותאם אישית
        let customEmailContent = `${customized.content}

📋 **טופס היכרות חשוב:**
כדי שנוכל לתת לכם ול-${appointmentData.pet_name} את השירות הטוב ביותר, אנא מלאו את טופס ההיכרות בקישור הבא:

👆 ${publicFormUrl}

**למה חשוב למלא את הטופס?**
• מאפשר לנו להכיר טוב יותר את ${appointmentData.pet_name} ואת הצרכים הייחודיים
• מקצר את זמן ההמתנה במרפאה ביום הביקור
• מבטיח שהרופא יהיה מוכן מראש עם כל המידע החשוב

🕒 **פרטי התור שלכם:**
${appointmentData.preferred_date ? `📅 תאריך מועדף: ${appointmentData.preferred_date}` : '📅 התאריך יתואם בהמשך'}
${appointmentData.preferred_time ? `🕐 שעה מועדפת: ${appointmentData.preferred_time}` : '🕐 השעה תתואם בהמשך'}
🏥 סוג ביקור: ${appointmentData.request_type === 'vaccination' ? 'חיסון' : 'ביקור רפואי'}

`;

        if (appointmentData.request_type === 'medical_visit') {
            customEmailContent += `⚠️ **חשוב לדעת:**
התור עדיין לא נקבע באופן סופי. נציג מהמרפאה ייצור עמכם קשר טלפוני בהקדם כדי לאשר את המועד המדויק ולתאם את התאריך והשעה הסופיים.

`;
        }

        customEmailContent += `💡 **טיפים לביקור הראשון:**
• הביאו איתכם כל תיעוד רפואי קודם (אם קיים)
• ${appointmentData.pet_name} יכול/ה להיות קצת לחוצ/ה - זה נורמלי לחלוטין
• הגיעו 10 דקות לפני השעה שנקבעה

יש לכם שאלות? אנחנו כאן בשבילכם! 📞

בהצלחה ומחכים לראות אתכם ואת ${appointmentData.pet_name} בקרוב! 🐕🐱

${customized.baseContent.signature}`;

        // הודעת וואטסאפ מותאמת אישית
        const customWhatsAppMessage = `${customized.whatsapp}

🔗 טופס היכרות: ${publicFormUrl}

צוות טדי וטס 🏥`;

        // שליחת המייל המותאם אישית
        if (appointmentData.owner_email) {
            const emailSent = await sendEmail(
                appointmentData.owner_email,
                customized.subject,
                customEmailContent,
                appointmentData.clinic_id
            );

            console.log('[handleAppointmentBooking] Email sending result:', emailSent);
        }

        return Response.json({
            success: true,
            message: 'New customer - customized journey started successfully',
            intake_form_id: intakeForm.id,
            form_url: publicFormUrl,
            content_type: appointmentData.request_type,
            pet_type: appointmentData.pet_type,
            whatsapp_message: customWhatsAppMessage
        });

    } catch (error) {
        console.error('[handleAppointmentBooking] Error:', error);
        
        return Response.json({
            success: false,
            error: 'שגיאה בעיבוד מסע הלקוח המותאם אישית',
            details: error.message
        }, { status: 500 });
    }
});