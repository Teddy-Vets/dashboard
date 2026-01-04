import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const requiredEnv = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'FRONTEND_URL'];

Deno.serve(async (req) => {
    for (const key of requiredEnv) {
        if (!Deno.env.get(key)) {
            console.error(`Missing required environment variable: ${key}`);
            return new Response(`Server configuration error: Missing ${key}`, { status: 500 });
        }
    }

    try {
        const url = new URL(req.url);
        const code = url.searchParams.get('code');
        const stateParam = url.searchParams.get('state');

        if (!code || !stateParam) {
            return new Response('Missing code or state parameter', { status: 400 });
        }

        const { clinicId } = JSON.parse(stateParam);
        if (!clinicId) {
            return new Response('Invalid state: clinicId is missing', { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        
        // Exchange authorization code for tokens
        const tokenUrl = 'https://oauth2.googleapis.com/token';
        const redirectUri = `${Deno.env.get('FRONTEND_URL')}/api/handleGoogleAuthCallback`;

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
            throw new Error(`Failed to get tokens: ${tokenResponse.statusText}`);
        }

        const tokens = await tokenResponse.json();
        const { access_token, refresh_token } = tokens;

        if (!access_token) {
            throw new Error('Access token not found in Google response');
        }

        // Get user's primary calendar ID
        const calendarApiUrl = 'https://www.googleapis.com/calendar/v3/users/me/calendarList/primary';
        const calendarResponse = await fetch(calendarApiUrl, {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });

        if (!calendarResponse.ok) {
            throw new Error('Failed to get primary calendar ID from Google.');
        }

        const calendarData = await calendarResponse.json();
        const calendarId = calendarData.id;

        if (!calendarId) {
            throw new Error('Primary calendar ID not found.');
        }
        
        // Store tokens and calendar ID in the Clinic entity
        await base44.asServiceRole.entities.Clinic.update(clinicId, {
            google_calendar_access_token: access_token,
            google_calendar_refresh_token: refresh_token, // May be null if already granted
            google_calendar_id: calendarId,
            google_calendar_last_sync: new Date().toISOString(),
        });
        
        // Redirect user back to the settings page
        const settingsUrl = `${Deno.env.get('FRONTEND_URL')}/ClinicSettings`;
        return new Response(null, {
            status: 302, // Found (redirect)
            headers: {
                'Location': settingsUrl,
            },
        });

    } catch (error) {
        console.error('Error in handleGoogleAuthCallback:', error);
        const errorUrl = `${Deno.env.get('FRONTEND_URL')}/ClinicSettings?error=${encodeURIComponent(error.message)}`;
        return new Response(null, {
            status: 302,
            headers: { 'Location': errorUrl }
        });
    }
});