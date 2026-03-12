import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

async function createContentHash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
    try {
        const body = await req.json();
        const { token, signature_data, signature_verification_data } = body;

        if (!token || !signature_data) {
            return Response.json({ error: 'Bad request: missing token or signature' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);

        // Validate link
        const validationResponse = await base44.functions.invoke('validateLink', { t: token });
        if (!validationResponse.data?.valid) {
            return Response.json({ error: validationResponse.data?.error || 'Invalid or expired link' }, { status: 410 });
        }

        const form = validationResponse.data.form;
        if (!form || !form.id) {
            return Response.json({ error: 'Subscription agreement not found' }, { status: 404 });
        }

        if (form.status === 'legally_sealed' || form.status === 'signed') {
            return Response.json({ error: 'טופס זה כבר נחתם. לא ניתן לשלוח אותו שוב.', status: form.status }, { status: 409 });
        }

        const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
        const userAgent = req.headers.get('user-agent') || 'unknown';

        const formContentToHash = {
            id: form.id,
            owner_name: form.owner_name,
            pet_name: form.pet_name,
            selected_plan: form.selected_plan,
            payment_frequency: form.payment_frequency,
            owner_id_number: form.owner_id_number
        };
        const form_content_hash = await createContentHash(formContentToHash);
        const signature_hash = await createContentHash(signature_data);

        const signed_at = new Date().toISOString();
        const signature_timestamp = Date.now();

        const updatedForm = await base44.asServiceRole.entities.SubscriptionAgreement.update(form.id, {
            status: 'legally_sealed',
            signed_at,
            signature_data,
            signature_hash,
            form_content_hash,
            signature_ip: clientIp,
            signature_user_agent: userAgent,
            signature_timestamp,
            signature_verification_data,
            immutable_record: true
        });

        console.log(`[submitSubscriptionAgreement] Form ${form.id} legally sealed.`);

        return Response.json({
            success: true,
            form_id: updatedForm.id,
            status: updatedForm.status,
            message: "Subscription agreement has been securely signed and sealed."
        });

    } catch (error) {
        console.error('[submitSubscriptionAgreement] Error:', error.message);
        return Response.json({ error: 'Server error', details: error.message }, { status: 500 });
    }
});