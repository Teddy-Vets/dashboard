import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

Deno.serve(async (req) => {
  try {
    // קבלת מזהה הטופס מהבקשה
    const { form_id } = await req.json();

    if (!form_id) {
      return new Response(JSON.stringify({ error: 'Missing form_id' }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const base44 = createClientFromRequest(req);
    
    // חיפוש הטופס לפי מזהה באמצעות entities API
    try {
      const formData = await base44.asServiceRole.entities.IntakeForm.get(form_id);

      if (!formData) {
        return new Response(JSON.stringify({ error: 'Form not found' }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // בדיקה שהטופס עדיין במצב טיוטה (ניתן לעריכה)
      if (formData.status && formData.status !== 'draft') {
        return new Response(JSON.stringify({ 
          error: 'Form is no longer editable',
          details: `Form status is: ${formData.status}` 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // החזרת נתוני הטופס
      const responseData = {
        formData: formData
      };

      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    } catch (getError) {
      console.error('Error retrieving form:', getError);
      return new Response(JSON.stringify({ 
        error: 'Form not found',
        details: 'The form may have been deleted or does not exist' 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

  } catch (error) {
    console.error('Error in getPublicIntakeForm function:', error);
    return new Response(JSON.stringify({ 
      error: 'Server error', 
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});