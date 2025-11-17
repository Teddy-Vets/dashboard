import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// פונקציה לעיצוב גוף המייל עם Header ו-Footer
const createHtmlBody = (content, clinicInfo) => {
  const header = `
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687b78971cad562073ed5929/450e11dd2_Yourparagraphtext.png" alt="טדי וטס" style="width: 220px; height: auto;"/>
    </div>
  `;

  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      ${header}
      <div style="font-size: 16px; color: #333; line-height: 1.6;">
        ${content.replace(/\n/g, '<br>')}
      </div>
    </div>
  `;
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // No user auth required for service-to-service calls, but good practice to have the option
        // const user = await base44.auth.me();

        const { to, subject, body, from_name, clinic_id } = await req.json();

        if (!to || !subject || !body) {
            return Response.json({ 
                error: 'Missing required fields: to, subject, body' 
            }, { status: 400 });
        }

        const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
        if (!SENDGRID_API_KEY) {
            console.error('[sendEmailWithSendGrid] SendGrid API key not configured');
            return Response.json({ error: 'SendGrid API key not configured' }, { status: 500 });
        }

        // טעינת פרטי מרפאה עבור הפוטר
        let clinicInfo = null;
        if (clinic_id) {
          try {
            const clinics = await base44.asServiceRole.entities.Clinic.filter({ id: clinic_id });
            clinicInfo = clinics?.[0];
          } catch(e) {
            console.warn(`Could not load clinic info for ID: ${clinic_id}`);
          }
        }

        // יצירת גוף HTML מלא
        const htmlBody = createHtmlBody(body, clinicInfo);

        const emailData = {
            personalizations: [{
                to: [{ email: to }],
                subject: subject
            }],
            from: {
                email: 'noreply@teddyvets.com',
                name: from_name || 'טדי וטס - מרפאה וטרינרית'
            },
            content: [{
                type: 'text/html',
                value: htmlBody
            }]
        };

        console.log(`[sendEmailWithSendGrid] Sending email to: ${to}`);

        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });

        if (response.ok) {
            console.log(`[sendEmailWithSendGrid] Email sent successfully to: ${to}`);
            return Response.json({ 
                success: true, 
                message: 'Email sent successfully',
                recipient: to 
            });
        } else {
            const errorText = await response.text();
            console.error(`[sendEmailWithSendGrid] SendGrid API error:`, errorText);
            return Response.json({ 
                success: false,
                error: 'Failed to send email',
                details: errorText 
            }, { status: response.status });
        }

    } catch (error) {
        console.error('[sendEmailWithSendGrid] Error:', error);
        return Response.json({ 
            success: false,
            error: 'Server error', 
            details: error.message 
        }, { status: 500 });
    }
});