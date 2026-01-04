import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const requiredEnv = ['GOOGLE_CLIENT_ID', 'FRONTEND_URL'];

Deno.serve(async (req) => {
  console.log('initiateGoogleAuth function invoked');
  for (const key of requiredEnv) {
    if (!Deno.env.get(key)) {
      console.error(`Missing required environment variable: ${key}`);
      return new Response(JSON.stringify({ error: `Server configuration error: Missing ${key}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      console.warn('Unauthorized access attempt to initiateGoogleAuth');
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const { clinicId } = await req.json();
    if (!clinicId) {
      console.error('Missing clinicId in request body');
      return new Response(JSON.stringify({ error: 'clinicId is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    console.log(`Initiating auth for clinicId: ${clinicId}`);

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    // The redirect URI must be registered in the Google Cloud Console for your OAuth client.
    const redirectUri = `https://${Deno.env.get('BASE44_APP_ID')}.base44.app/api/handleGoogleAuthCallback`;
    
    console.log(`Using Redirect URI: ${redirectUri}`);

    const scopes = [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes.join(' '));
    authUrl.searchParams.set('access_type', 'offline'); // To get a refresh token
    authUrl.searchParams.set('prompt', 'consent'); // To ensure a refresh token is always sent
    authUrl.searchParams.set('state', JSON.stringify({ clinicId }));
    
    console.log(`Generated Auth URL: ${authUrl.toString()}`);

    // Return the URL for the client to redirect to
    return new Response(JSON.stringify({ authorizationUrl: authUrl.toString() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in initiateGoogleAuth:', error);
    return new Response(JSON.stringify({ error: 'Failed to initiate Google authentication' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});