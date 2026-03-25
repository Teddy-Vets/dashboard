import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Helper function to refresh access token
export async function refreshClinicGoogleToken(base44Service, clinic) {
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: clinic.google_calendar_refresh_token,
            grant_type: 'refresh_token',
        }),
    });

    if (!tokenResponse.ok) {
        throw new Error('Failed to refresh Google token');
    }

    const tokens = await tokenResponse.json();

    // Update clinic with new access token
    await base44Service.entities.Clinic.update(clinic.id, {
        google_calendar_access_token: tokens.access_token,
        google_calendar_last_sync: new Date().toISOString(),
    });

    return tokens.access_token;
}

Deno.serve(async (req) => {
    return new Response(JSON.stringify({ message: 'This is a helper function, not a standalone endpoint' }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
    });
});