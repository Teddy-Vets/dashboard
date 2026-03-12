import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const formData = await req.json();

        console.log('[submitIntake] Received form data:', JSON.stringify(formData, null, 2));

        if (!formData.id) {
            console.error('[submitIntake] Missing form ID');
            return Response.json({
                success: false,
                error: 'מזהה הטופס חסר'
            }, { status: 400 });
        }

        // בדיקה אם המשתמש מחובר (לא חובה בטפסים ציבוריים)
        let user = null;
        try {
            user = await base44.auth.me();
            console.log('[submitIntake] User authenticated:', user?.email);
        } catch (authError) {
            console.log('[submitIntake] No authenticated user - public form submission');
        }

        // קריאת הטופס הקיים מהמסד כדי לקבל clinic_id אמין
        const existingForms = await base44.asServiceRole.entities.IntakeForm.filter({ id: formData.id });
        const existingForm = existingForms?.[0] || {};
        const clinic_id = existingForm.clinic_id || formData.clinic_id;

        // עדכון הטופס לסטטוס submitted - תמיד נשתמש ב-service role
        const updatedForm = await base44.asServiceRole.entities.IntakeForm.update(formData.id, {
            ...formData,
            clinic_id,
            status: 'submitted',
            completed_at: new Date().toISOString(),
            client_consent: true
        });

        console.log('[submitIntake] Updated IntakeForm:', updatedForm.id);

        // יצירה/עדכון של רשומת Client (אופציונלי)
        let client = null;
        let clientId = null;

        if (formData.owner_name && (formData.owner_email || formData.owner_phone)) {
            try {
                // חיפוש לקוח קיים לפי אימייל או טלפון
                const searchFilters = [];
                if (formData.owner_email) searchFilters.push({ email: formData.owner_email });
                if (formData.owner_phone) searchFilters.push({ phone: formData.owner_phone });

                if (searchFilters.length > 0) {
                    const existingClients = await base44.asServiceRole.entities.Client.filter({
                        clinic_id: formData.clinic_id,
                        $or: searchFilters
                    });

                    if (existingClients.length > 0) {
                        client = existingClients[0];
                        clientId = client.id;
                        console.log('[submitIntake] Found existing client:', clientId);

                        // עדכון פרטי הלקוח הקיים
                        client = await base44.asServiceRole.entities.Client.update(clientId, {
                            owner_name: formData.owner_name || client.owner_name,
                            phone: formData.owner_phone || client.phone,
                            email: formData.owner_email || client.email,
                            address: formData.address || client.address,
                            status: 'active'
                        });
                    } else {
                        // יצירת לקוח חדש
                        console.log('[submitIntake] Creating new client');
                        client = await base44.asServiceRole.entities.Client.create({
                            clinic_id,
                            owner_name: formData.owner_name,
                            phone: formData.owner_phone || '',
                            email: formData.owner_email || '',
                            address: formData.address || '',
                            status: 'new'
                        });
                        clientId = client.id;
                        console.log('[submitIntake] Created new client:', clientId);
                    }
                }
            } catch (clientError) {
                console.warn('[submitIntake] Error handling client:', clientError);
                // ממשיכים אפילו אם יצירת הלקוח נכשלה
            }
        }

        // יצירה/עדכון של רשומת Pet (אופציונלי)
        let pet = null;
        let petId = null;

        if (clientId && formData.pet_name) {
            try {
                // חיפוש חיית מחמד קיימת
                const existingPets = await base44.asServiceRole.entities.Pet.filter({
                    client_id: clientId,
                    pet_name: formData.pet_name
                });

                if (existingPets.length > 0) {
                    pet = existingPets[0];
                    petId = pet.id;
                    console.log('[submitIntake] Found existing pet:', petId);

                    // עדכון פרטי חיית המחמד הקיימת
                    pet = await base44.asServiceRole.entities.Pet.update(petId, {
                        pet_type: formData.pet_type || pet.pet_type || 'כלב',
                        breed: formData.pet_breed || pet.breed,
                        age_estimate: formData.pet_age || pet.age_estimate,
                        gender: formData.pet_gender || pet.gender,
                        neutered: formData.pet_neutered || pet.neutered,
                        microchip: formData.pet_microchip || pet.microchip,
                        picture_url: formData.pet_picture_url || pet.picture_url,
                        status: 'active'
                    });
                } else {
                    // יצירת חיית מחמד חדשה
                    console.log('[submitIntake] Creating new pet');
                    pet = await base44.asServiceRole.entities.Pet.create({
                        clinic_id,
                        client_id: clientId,
                        pet_name: formData.pet_name,
                        pet_type: formData.pet_type || 'כלב',
                        breed: formData.pet_breed || '',
                        age_estimate: formData.pet_age || '',
                        gender: formData.pet_gender || '',
                        neutered: formData.pet_neutered || '',
                        microchip: formData.pet_microchip || '',
                        color_markings: '',
                        picture_url: formData.pet_picture_url || '',
                        medical_conditions: [],
                        medications: [],
                        allergies: [],
                        status: 'active'
                    });
                    petId = pet.id;
                    console.log('[submitIntake] Created new pet:', petId);
                }
            } catch (petError) {
                console.warn('[submitIntake] Error handling pet:', petError);
                // ממשיכים אפילו אם יצירת חיית המחמד נכשלה
            }
        }

        // עדכון IntakeForm עם client_id ו-pet_id אם נוצרו
        try {
            if (clientId || petId) {
                const finalUpdate = {};
                if (clientId) finalUpdate.client_id = clientId;
                if (petId) finalUpdate.pet_id = petId;

                await base44.asServiceRole.entities.IntakeForm.update(formData.id, finalUpdate);
                console.log('[submitIntake] Updated IntakeForm with client_id and pet_id');
            }
        } catch (updateError) {
            console.warn('[submitIntake] Error updating IntakeForm with IDs:', updateError);
            // לא כשל קריטי - הטופס עדיין נשלח
        }

        return Response.json({
            success: true,
            message: 'טופס ההיכרות נשלח בהצלחה',
            intakeFormId: updatedForm.id,
            clientId: clientId,
            petId: petId
        });

    } catch (error) {
        console.error('[submitIntake] Error:', error);
        
        // טיפול בסוגי שגיאות שונים
        let errorMessage = 'שגיאה בשליחת הטופס';
        
        if (error.message?.includes('not found')) {
            errorMessage = 'הטופס לא נמצא במערכת';
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