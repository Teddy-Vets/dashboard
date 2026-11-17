import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

/**
 * יוצר טופס היכרות טיוטה + קישור ציבורי מאובטח (72 שעות).
 * היצירה מתבצעת בצד השרת כדי שלא תהיה תלויה בהרשאות הדפדפן.
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const {
      clinic_id,
      owner_name = '',
      owner_phone = '',
      owner_email = '',
      pet_name = '',
      owner_id_number = ''
    } = body || {};

    const isAdmin = user.role === 'admin';
    const clinicId = isAdmin ? clinic_id : user.clinic_id;

    if (!clinicId) {
      return Response.json({ error: 'לא נבחרה מרפאה' }, { status: 400 });
    }
    if (!isAdmin && clinic_id && clinic_id !== user.clinic_id) {
      return Response.json({ error: 'אין הרשאה למרפאה זו' }, { status: 403 });
    }

    const clinic = await base44.asServiceRole.entities.Clinic.get(clinicId)
      .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!clinic) {
      return Response.json({ error: 'המרפאה לא נמצאה' }, { status: 404 });
    }

    const intakeForm = await base44.asServiceRole.entities.IntakeForm.create({
      clinic_id: clinicId,
      owner_name: owner_name || '',
      owner_id_number: owner_id_number || '',
      owner_phone: owner_phone || '',
      owner_email: owner_email || '',
      pet_name: pet_name || '',
      status: 'draft',
      staff_notes: `טופס נוצר ע"י ${user.full_name || user.email} ונשלח ללקוח למילוי מלא`
    });

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

    await base44.asServiceRole.entities.FormLinks.create({
      token,
      form_type: 'intake',
      clinic_id: clinicId,
      form_id: intakeForm.id,
      metadata: { owner_name: owner_name || '', pet_name: pet_name || '' },
      expires_at: expiresAt,
      used_at: null,
      used_by_ip: null,
      access_count: 0
    });

    return Response.json({ token, form_id: intakeForm.id, expires_at: expiresAt }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}