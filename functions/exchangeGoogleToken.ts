import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const requiredEnv = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'FRONTEND_URL'];

Deno.serve(async (req) => {
    // Handle CORS preflight requests if needed (though SDK usually handles this via proxy)
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    }

    for (const key of requiredEnv) {
        if (!Deno.env.get(key)) {
            console.error(`Missing required environment variable: ${key}`);
            return new Response(JSON.stringify({ error: `Server configuration error: Missing ${key}` }), { status: 500, headers: {'Content-Type': 'application/json'} });
        }
    }

    try {
        const { code, state } = await req.json();

        if (!code || !state) {
            return new Response(JSON.stringify({ error: 'Missing code or state parameter' }), { status: 400, headers: {'Content-Type': 'application/json'} });
        }

        let clinicId;
        try {
            // Attempt to parse state. It might be a JSON string or just the string if double encoded? 
            // Usually it's a JSON string: {"clinicId":"..."}
            const parsedState = JSON.parse(state);
            clinicId = parsedState.clinicId;
        } catch (e) {
            console.error('Failed to parse state param:', state, e);
            return new Response(JSON.stringify({ error: 'Invalid state parameter format' }), { status: 400, headers: {'Content-Type': 'application/json'} });
        }

        if (!clinicId) {
            return new Response(JSON.stringify({ error: 'Invalid state: clinicId is missing' }), { status: 400, headers: {'Content-Type': 'application/json'} });
        }

        const base44 = createClientFromRequest(req);
        
        // Exchange authorization code for tokens
        const tokenUrl = 'https://oauth2.googleapis.com/token';
        // IMPORTANT: This must match EXACTLY the redirect_uri used in the initial request
        // Ensure no double slashes if FRONTEND_URL ends with /
        const baseUrl = Deno.env.get('FRONTEND_URL').replace(/\/$/, '');
        const redirectUri = `${baseUrl}/GoogleCallback`;

        const params = new URLSearchParams();
        params.append('client_id', Deno.env.get('GOOGLE_CLIENT_ID'));
        params.append('client_secret', Deno.env.get('GOOGLE_CLIENT_SECRET'));
        params.append('code', code);
        params.append('grant_type', 'authorization_code');
        params.append('redirect_uri', redirectUri);

        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        });

        if (!tokenResponse.ok) {
            const errorBody = await tokenResponse.text();
            console.error('Failed to exchange code for token:', errorBody);
            // Return detailed error for frontend debugging
            return new Response(JSON.stringify({ error: `Failed to get tokens from Google: ${tokenResponse.statusText}`, details: errorBody }), { status: 400, headers: {'Content-Type': 'application/json'} });
        }

        const tokens = await tokenResponse.json();
        const { access_token, refresh_token } = tokens;

        if (!access_token) {
             return new Response(JSON.stringify({ error: 'Access token not found in Google response' }), { status: 400, headers: {'Content-Type': 'application/json'} });
        }

        // Get user's primary calendar ID
        const calendarApiUrl = 'https://www.googleapis.com/calendar/v3/users/me/calendarList/primary';
        const calendarResponse = await fetch(calendarApiUrl, {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });

        if (!calendarResponse.ok) {
            return new Response(JSON.stringify({ error: 'Failed to get primary calendar ID from Google.' }), { status: 400, headers: {'Content-Type': 'application/json'} });
        }

        const calendarData = await calendarResponse.json();
        const calendarId = calendarData.id;

        if (!calendarId) {
            return new Response(JSON.stringify({ error: 'Primary calendar ID not found.' }), { status: 400, headers: {'Content-Type': 'application/json'} });
        }
        
        // Store tokens and calendar ID in the Clinic entity
        await base44.asServiceRole.entities.Clinic.update(clinicId, {
            google_calendar_access_token: access_token,
            google_calendar_refresh_token: refresh_token, // May be null if already granted
            google_calendar_id: calendarId,
            google_calendar_last_sync: new Date().toISOString(),
        });
        
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error('Error in exchangeGoogleToken:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});