import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { code, clinicId } = await req.json();

        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Unauthorized - Admin only' }), { 
                status: 403, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        if (!code || !clinicId) {
            return new Response(JSON.stringify({ error: 'Missing code or clinicId' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
        const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
        const redirectUri = `${Deno.env.get('FRONTEND_URL')}/ClinicSettings`;

        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        if (!tokenResponse.ok) {
            const error = await tokenResponse.json();
            console.error('Google token error:', error);
            return new Response(JSON.stringify({ error: 'Failed to get tokens from Google' }), { 
                status: 500, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const tokens = await tokenResponse.json();

        // Get user's email from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { 'Authorization': `Bearer ${tokens.access_token}` },
        });

        const userInfo = await userInfoResponse.json();

        // Save tokens to clinic
        const base44Service = base44.asServiceRole;
        await base44Service.entities.Clinic.update(clinicId, {
            google_calendar_access_token: tokens.access_token,
            google_calendar_refresh_token: tokens.refresh_token,
            google_calendar_id: userInfo.email,
            google_calendar_last_sync: new Date().toISOString(),
        });

        return new Response(JSON.stringify({ 
            success: true, 
            email: userInfo.email 
        }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });

    } catch (error) {
        console.error('Error connecting Google Calendar:', error);
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
});