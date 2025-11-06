import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const { t: token } = await req.json();
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';

    if (!token) {
      return new Response(JSON.stringify({ 
        valid: false,
        error: 'Missing token' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const base44 = createClientFromRequest(req);
    
    // חיפוש הקישור לפי טוקן
    const links = await base44.asServiceRole.entities.FormLinks.filter({ token });
    const link = links?.[0];

    if (!link) {
      console.warn(`[validateLink] Invalid token attempt from IP: ${clientIp}, token: ${token.substring(0, 8)}...`);
      
      return new Response(JSON.stringify({ 
        valid: false,
        error: 'Link not found or expired' 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // בדיקת תוקף זמן (72 שעות)
    const createdAt = new Date(link.created_date);
    const expiryTime = 72 * 60 * 60 * 1000; // 72 שעות במילישניות
    const now = new Date();
    
    if (now.getTime() - createdAt.getTime() > expiryTime) {
      console.warn(`[validateLink] Expired token used from IP: ${clientIp}, created: ${link.created_date}`);
      
      return new Response(JSON.stringify({ 
        valid: false,
        error: 'Link has expired' 
      }), {
        status: 410,
        headers: { "Content-Type": "application/json" },
      });
    }

    // עדכון מונה גישה
    await base44.asServiceRole.entities.FormLinks.update(link.id, {
      access_count: (link.access_count || 0) + 1,
      used_by_ip: clientIp
    });
    
    // טעינת נתוני הטופס לפי סוג
    let formData = {};
    if (link.form_id) {
      try {
        switch (link.form_type) {
          case 'consent': {
            const consentResults = await base44.asServiceRole.entities.ConsentForm.filter({ id: link.form_id });
            formData = consentResults?.[0] || {};
            break;
          }
            
          case 'intake': {
            const intakeResults = await base44.asServiceRole.entities.IntakeForm.filter({ id: link.form_id });
            formData = intakeResults?.[0] || {};
            break;
          }
            
          case 'anxiety_questionnaire': {
            const anxietyResults = await base44.asServiceRole.entities.AnxietyQuestionnaire.filter({ id: link.form_id });
            formData = anxietyResults?.[0] || {};
            break;
          }
            
          case 'spay_neuter_instructions': {
            const spayResults = await base44.asServiceRole.entities.SpayNeuterInstructions.filter({ id: link.form_id });
            formData = spayResults?.[0] || {};
            break;
          }
            
          case 'dental_care_instructions': {
            const dentalResults = await base44.asServiceRole.entities.DentalCareInstructions.filter({ id: link.form_id });
            formData = dentalResults?.[0] || {};
            break;
          }
            
          case 'post_surgery_instructions': {
            const postSurgeryResults = await base44.asServiceRole.entities.PostSurgeryInstructions.filter({ id: link.form_id });
            formData = postSurgeryResults?.[0] || {};
            break;
          }
            
          case 'rabies_declaration': {
            const rabiesResults = await base44.asServiceRole.entities.RabiesDeclaration.filter({ id: link.form_id });
            formData = rabiesResults?.[0] || {};
            break;
          }
        }
      } catch (e) {
        console.warn(`Form with ID ${link.form_id} not found, but link is valid. Proceeding.`, e);
      }
    }

    // רישום שימוש מוצלח ליומן
    console.log(`[validateLink] Successful access from IP: ${clientIp}, form_type: ${link.form_type}, form_id: ${link.form_id}`);

    // החזרת מבנה נתונים מאוחד
    const responseData = {
      valid: true,
      form: formData,
      linkData: {
        form_type: link.form_type,
        clinic_id: link.clinic_id,
        form_id: link.form_id,
        metadata: link.metadata,
        token: link.token,
        expires_in_hours: Math.max(0, Math.floor((expiryTime - (now.getTime() - createdAt.getTime())) / (60 * 60 * 1000)))
      }
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in validateLink function:', error);
    return new Response(JSON.stringify({ 
      valid: false,
      error: 'Server error', 
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});