import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // קבלת הנתונים מהבקשה
        let appointmentData;
        try {
            appointmentData = await req.json();
            console.log('[handleAppointmentBooking] Received appointment data:', JSON.stringify(appointmentData, null, 2));
        } catch (parseError) {
            console.error('[handleAppointmentBooking] Failed to parse request body:', parseError);
            return Response.json({
                success: false,
                error: 'Invalid request body'
            }, { status: 400 });
        }

        if (!appointmentData || !appointmentData.clinic_id) {
            console.error('[handleAppointmentBooking] Missing clinic_id in appointment data');
            return Response.json({
                success: false,
                error: 'Missing required field: clinic_id'
            }, { status: 400 });
        }

        console.log('[handleAppointmentBooking] Processing appointment:', appointmentData.id);

        // טעינת פרטי המרפאה (כולל מייל)
        let clinicInfo = null;
        let clinics = [];
        try {
            clinics = await base44.asServiceRole.entities.Clinic.filter({ id: appointmentData.clinic_id });
            clinicInfo = clinics?.[0];
            console.log('[handleAppointmentBooking] Clinic loaded:', clinicInfo?.name);
        } catch (error) {
            console.warn('[handleAppointmentBooking] Could not load clinic info:', error);
        }

        // פונקציה לבחירת תוכן מותאם אישית
        const getCustomizedContent = (appointmentData) => {
            const { request_type, pet_type, owner_name, pet_name } = appointmentData;
            
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
• ${pet_name} עלול/ה להרגיש קצת עייף/ה ביום הראשון - זה נורמלי לחלוטין

🎯 **הכנה לחיסון:**
• הביאו את פנקס החיסונים הקודם (אם יש)
• וודאו ש-${pet_name} בבריאות טובה ביום החיסון
• אם יש לכם שאלות על החיסון - נענה עליהן במרפאה`;

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
• האם ${pet_name} נחשף/ה למשהו חדש לאחרונה?`;

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
                console.log(`[handleAppointmentBooking] Attempting to send email to: ${to}`);
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
            
            const returningCustomerSubject = `✅ אישור תור - ${appointmentData.pet_name} במרפאת טדי וטס`;
            
            const clinicName = clinics.find(c => c.id === appointmentData.clinic_id)?.name || 'טדי וטס';
            
            let returningCustomerEmail = `<div style="font-size: 18px; color: #2c3e50; margin-bottom: 25px;">שלום ${appointmentData.owner_name},</div>

<div style="font-size: 16px; color: #34495e; margin-bottom: 30px;">נשמח לפגוש אתכם ואת ${appointmentData.pet_name}! 🐾</div>

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 25px; margin: 25px 0; color: white;">
  <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; text-align: center;">פרטי התור</div>
  <div style="font-size: 15px; line-height: 2;">
    <div style="margin-bottom: 8px;">📅 <strong>תאריך מועדף:</strong> ${appointmentData.preferred_date || 'יתואם בהמשך'}</div>
    <div style="margin-bottom: 8px;">🕐 <strong>שעה מועדפת:</strong> ${appointmentData.preferred_time || 'תתואם בהמשך'}</div>
    <div>🏥 <strong>סוג ביקור:</strong> ${appointmentData.request_type === 'vaccination' ? 'חיסון' : 'ביקור רפואי'}</div>
  </div>
</div>

`;

            if (appointmentData.request_type === 'medical_visit') {
                returningCustomerEmail += `<div style="background-color: #fff3cd; border-right: 4px solid #ffc107; padding: 15px; border-radius: 6px; margin: 20px 0; color: #856404;">
  <strong>⚠️ שימו לב:</strong> נציג מהמרפאה ייצור עמכם קשר בהקדם לאישור המועד הסופי.
</div>

`;
            }

            returningCustomerEmail += `<div style="background-color: #e8f5e9; border-radius: 8px; padding: 20px; margin: 25px 0;">
  <div style="font-size: 16px; color: #2e7d32; margin-bottom: 12px;"><strong>זמינים עבורכם תמיד 💚</strong></div>
  <div style="font-size: 14px; color: #388e3c; line-height: 1.8;">
    📱 <a href="https://wa.me/972548959176" style="color: #25D366; text-decoration: none; font-weight: bold;">וואטסאפ המרפאה</a><br>
    ☎️ <strong>טלפון המרפאה:</strong> ${clinicInfo?.phone || '03-1234567'}
  </div>
</div>

<div style="margin-top: 35px; padding-top: 25px; border-top: 2px solid #ecf0f1; text-align: center; color: #7f8c8d; font-size: 15px;">
  מצפים לראותכם,<br>
  <strong style="color: #2c3e50;">צוות טדי וטס - ${clinicName}</strong>
</div>`;

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

        const publicFormUrl = `${Deno.env.get('FRONTEND_URL') || 'https://your-app-url.com'}/PublicForm?id=${intakeForm.id}`;

        const customized = getCustomizedContent(appointmentData);

        const clinicName = clinics.find(c => c.id === appointmentData.clinic_id)?.name || 'טדי וטס';
        
        let customEmailContent = `<div style="font-size: 18px; color: #2c3e50; margin-bottom: 25px;">שלום ${appointmentData.owner_name},</div>

<div style="font-size: 16px; color: #34495e; margin-bottom: 30px;">נשמח לפגוש אתכם ואת ${appointmentData.pet_name}! 🐾</div>

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 25px; margin: 25px 0; color: white;">
  <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; text-align: center;">פרטי התור</div>
  <div style="font-size: 15px; line-height: 2;">
    <div style="margin-bottom: 8px;">📅 <strong>תאריך מועדף:</strong> ${appointmentData.preferred_date || 'יתואם בהמשך'}</div>
    <div style="margin-bottom: 8px;">🕐 <strong>שעה מועדפת:</strong> ${appointmentData.preferred_time || 'תתואם בהמשך'}</div>
    <div>🏥 <strong>סוג ביקור:</strong> ${appointmentData.request_type === 'vaccination' ? 'חיסון' : 'ביקור רפואי'}</div>
  </div>
</div>

`;

        if (appointmentData.request_type === 'medical_visit') {
            customEmailContent += `<div style="background-color: #fff3cd; border-right: 4px solid #ffc107; padding: 15px; border-radius: 6px; margin: 20px 0; color: #856404;">
  <strong>⚠️ שימו לב:</strong> נציג מהמרפאה ייצור עמכם קשר בהקדם לאישור המועד הסופי.
</div>

`;
        }

        customEmailContent += `<div style="background-color: #e8f5e9; border-radius: 8px; padding: 20px; margin: 25px 0;">
  <div style="font-size: 16px; color: #2e7d32; margin-bottom: 12px;"><strong>זמינים עבורכם תמיד 💚</strong></div>
  <div style="font-size: 14px; color: #388e3c; line-height: 1.8;">
    📱 <a href="https://wa.me/972548959176" style="color: #25D366; text-decoration: none; font-weight: bold;">וואטסאפ המרפאה</a><br>
    ☎️ <strong>טלפון המרפאה:</strong> ${clinicInfo?.phone || '03-1234567'}
  </div>
</div>

<div style="margin-top: 35px; padding-top: 25px; border-top: 2px solid #ecf0f1; text-align: center; color: #7f8c8d; font-size: 15px;">
  מצפים לראותכם,<br>
  <strong style="color: #2c3e50;">צוות טדי וטס - ${clinicName}</strong>
</div>`;

        const customWhatsAppMessage = `${customized.whatsapp}

🔗 טופס היכרות: ${publicFormUrl}

צוות טדי וטס 🏥`;

        if (appointmentData.owner_email) {
            await sendEmail(
                appointmentData.owner_email,
                customized.subject,
                customEmailContent,
                appointmentData.clinic_id
            );
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
        console.error('[handleAppointmentBooking] Error stack:', error.stack);
        
        return Response.json({
            success: false,
            error: 'שגיאה בעיבוד מסע הלקוח המותאם אישית',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});