import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Helper function to refresh access token
async function refreshClinicGoogleToken(base44Service, clinic) {
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
    try {
        const base44 = createClientFromRequest(req);
        const { appointmentId } = await req.json();

        if (!appointmentId) {
            return new Response(JSON.stringify({ error: 'Appointment ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        const base44Service = base44.asServiceRole;

        const appointment = (await base44Service.entities.AppointmentRequest.filter({ id: appointmentId }))[0];
        if (!appointment) {
            return new Response(JSON.stringify({ error: 'Appointment not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        const clinic = (await base44Service.entities.Clinic.filter({ id: appointment.clinic_id }))[0];

        // Determine which token and calendar to use
        let accessToken;
        let calendarId;

        if (clinic?.google_calendar_refresh_token) {
            // Clinic has its own calendar connected - refresh token and use it
            try {
                accessToken = await refreshClinicGoogleToken(base44Service, clinic);
                calendarId = clinic.google_calendar_id || 'primary';
            } catch (error) {
                console.error('Failed to refresh clinic token, falling back to global connector:', error);
                accessToken = await base44Service.connectors.getAccessToken("googlecalendar");
                calendarId = 'primary';
            }
        } else {
            // Use global connector
            accessToken = await base44Service.connectors.getAccessToken("googlecalendar");
            if (!accessToken) {
                throw new Error('Failed to get Google Calendar access token.');
            }
            calendarId = 'primary';
        }
        const eventId = appointment.google_calendar_event_id;

        // Handle cancellation
        if (appointment.status === 'cancelled' && eventId) {
            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });

            if (response.ok || response.status === 410) { // 410 Gone is also a success
                await base44Service.entities.AppointmentRequest.update(appointment.id, { google_calendar_event_id: null });
                return new Response(JSON.stringify({ success: true, action: 'deleted' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
            } else {
                 const errorBody = await response.json();
                 console.error('Google Calendar API Error on delete:', errorBody);
                 // Don't throw an error, just log it. Maybe the event was already deleted.
                 return new Response(JSON.stringify({ success: false, action: 'delete_failed', error: errorBody }), { status: 200, headers: { 'Content-Type': 'application/json' } });
            }
        }

        // Do not sync if not confirmed or no datetime is set
        if (appointment.status !== 'confirmed' || !appointment.appointment_datetime) {
             return new Response(JSON.stringify({ message: 'Appointment not in a state to be synced.' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        
        const startTime = new Date(appointment.appointment_datetime);
        const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minutes duration

        const eventPayload = {
            summary: `${appointment.request_type === 'vaccination' ? 'חיסון' : 'ביקור רפואי'} ל${appointment.pet_name} (${appointment.owner_name}) במרפאה ${clinic?.name || 'טדי וטס'}`,
            description: `בעלים: ${appointment.owner_name}\nחיית מחמד: ${appointment.pet_name}\nסיבה: ${appointment.medical_reason || 'חיסון'}\nמרפאה: ${clinic?.name || 'לא צוין'}`,
            location: clinic?.address || '',
            start: { dateTime: startTime.toISOString(), timeZone: 'Asia/Jerusalem' },
            end: { dateTime: endTime.toISOString(), timeZone: 'Asia/Jerusalem' },
            attendees: clinic?.email ? [{ email: clinic.email }] : [],
        };

        let googleEvent;
        let newEventId = eventId;

        if (newEventId) {
            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${newEventId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(eventPayload),
            });
            
            if (!response.ok) {
                if (response.status === 404 || response.status === 410) { // Event not found, create new
                    newEventId = null;
                } else {
                    const errorBody = await response.json();
                    console.error('Google Calendar API Error on update:', errorBody);
                    throw new Error(`Failed to update calendar event: ${JSON.stringify(errorBody.error.errors)}`);
                }
            } else {
                googleEvent = await response.json();
            }
        }
        
        if (!newEventId) {
            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(eventPayload),
            });
            googleEvent = await response.json();

            if (!response.ok) {
                console.error('Google Calendar API Error on create:', googleEvent);
                throw new Error(`Failed to create calendar event: ${JSON.stringify(googleEvent.error.errors)}`);
            }
            
            await base44Service.entities.AppointmentRequest.update(appointment.id, {
                google_calendar_event_id: googleEvent.id,
            });
        }
        
        return new Response(JSON.stringify({ success: true, eventId: googleEvent.id }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('Error syncing to Google Calendar:', error.stack);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});