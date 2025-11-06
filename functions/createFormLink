import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { "Content-Type": "application/json" }
      });
    }

    const { form_type, clinic_id, metadata, form_id } = await req.json();
    
    // רשימת סוגי טפסים נתמכים
    const validFormTypes = [
      'intake', 
      'consent', 
      'rabies_declaration', 
      'anxiety_questionnaire',
      'spay_neuter_instructions',
      'dental_care_instructions',
      'post_surgery_instructions'
    ];
    
    if (!form_type || !validFormTypes.includes(form_type)) {
      return new Response(JSON.stringify({ 
        error: 'Missing or invalid form_type',
        valid_types: validFormTypes 
      }), { 
        status: 400, 
        headers: { "Content-Type": "application/json" }
      });
    }
    
    if (!clinic_id) {
      return new Response(JSON.stringify({ error: 'Missing clinic_id' }), { 
        status: 400, 
        headers: { "Content-Type": "application/json" }
      });
    }

    // וודא שהמשתמש מורשה ליצור קישור עבור המרפאה הזו
    if (user.role !== 'admin' && user.clinic_id !== clinic_id) {
      return new Response(JSON.stringify({ error: 'Forbidden - user not authorized for this clinic' }), { 
        status: 403, 
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log('Creating form link:', { form_type, clinic_id, form_id, metadata });

    // יצירת טוקן מאובטח וחישוב תוקף
    const token = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (72 * 60 * 60 * 1000)); // 72 שעות
    
    const linkData = {
      token,
      form_type,
      clinic_id,
      form_id: form_id || null, 
      metadata: metadata || {},
      expires_at: expiresAt.toISOString(),
      used_at: null,
      used_by_ip: null,
      access_count: 0
    };

    console.log('Link data to create:', linkData);

    // יצירת הקישור במסד הנתונים
    const newLink = await base44.asServiceRole.entities.FormLinks.create(linkData);
    
    console.log('Created secure link:', { id: newLink.id, token: newLink.token, expires_at: newLink.expires_at });

    // החזרת הטוקן החדש עם מידע על תוקף
    return new Response(JSON.stringify({ 
      success: true,
      token: newLink.token,
      expires_at: newLink.expires_at,
      expires_in_hours: 72,
      data: { token: newLink.token }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Error in createFormLink function:', error);
    return new Response(JSON.stringify({ 
      error: 'Server error', 
      details: error.message,
      stack: Deno.env.get('NODE_ENV') === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});