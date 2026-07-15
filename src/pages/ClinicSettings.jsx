import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { connectClinicGoogleCalendar } from '@/functions/connectClinicGoogleCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Power, PowerOff, Settings, Calendar, Check, X, CalendarClock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { TableSkeleton } from '@/components/common/LoadingSkeleton';
import { toast } from 'sonner';

const getClinics = async () => {
    return await base44.entities.Clinic.list();
};

export default function ClinicSettings() {
    const queryClient = useQueryClient();
    const [connectingClinic, setConnectingClinic] = useState(null);

    const { data: clinics, isLoading, isError, error } = useQuery({
        queryKey: ['clinics'],
        queryFn: getClinics,
    });

    // Handle OAuth callback
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const clinicId = urlParams.get('state');

        if (code && clinicId) {
            handleOAuthCallback(code, clinicId);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleOAuthCallback = async (code, clinicId) => {
        try {
            setConnectingClinic(clinicId);
            const response = await connectClinicGoogleCalendar({ code, clinicId });
            
            if (response.data.success) {
                toast.success(`Google Calendar חובר בהצלחה למרפאה (${response.data.email})`);
                queryClient.invalidateQueries(['clinics']);
            } else {
                throw new Error('Failed to connect');
            }
        } catch (error) {
            console.error('OAuth callback error:', error);
            toast.error('שגיאה בחיבור Google Calendar');
        } finally {
            setConnectingClinic(null);
        }
    };

    const handleConnectCalendar = (clinicId) => {
        const clientId = '1086447441446-ptdtulk0hqtoqgoj3qg0sans614mqe74.apps.googleusercontent.com';
        const redirectUri = encodeURIComponent(window.location.origin + '/ClinicSettings');
        const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.events email');
        
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${clientId}&` +
            `redirect_uri=${redirectUri}&` +
            `response_type=code&` +
            `scope=${scope}&` +
            `access_type=offline&` +
            `prompt=consent&` +
            `state=${clinicId}`;
        
        window.location.href = authUrl;
    };

    const handleDisconnectCalendar = async (clinicId) => {
        try {
            await base44.entities.Clinic.update(clinicId, {
                google_calendar_access_token: null,
                google_calendar_refresh_token: null,
                google_calendar_id: null,
            });
            toast.success('Google Calendar נותק בהצלחה');
            queryClient.invalidateQueries(['clinics']);
        } catch (error) {
            console.error('Error disconnecting:', error);
            toast.error('שגיאה בניתוק Google Calendar');
        }
    };

    const handleToggleAppointments = async (clinicId, checked) => {
        try {
            const clinic = clinics.find(c => c.id === clinicId);
            const currentSettings = clinic.settings || {};
            await base44.entities.Clinic.update(clinicId, {
                settings: { ...currentSettings, allow_appointments: checked }
            });
            toast.success(checked ? 'תיאום תורים אונליין נפתח' : 'תיאום תורים אונליין נסגר');
            queryClient.invalidateQueries(['clinics']);
        } catch (error) {
            console.error('Error toggling appointments:', error);
            toast.error('שגיאה בעדכון הגדרות תיאום תורים');
        }
    };

    return (
        <div dir="rtl" className="p-4 md:p-6 space-y-4 md:space-y-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <PageHeader
                    title="הגדרות מרפאה וסנכרון"
                    description="נהל את הגדרות המרפאות שלך וחבר אותן לשירותים חיצוניים כמו Google Calendar."
                />

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-blue-600" />
                            <span>סנכרון Google Calendar</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Power className="w-5 h-5 text-green-600" />
                                <p className="text-green-800 font-medium">Google Calendar מחובר באופן גלובלי</p>
                            </div>
                            <p className="text-green-700 text-sm mt-2">
                                כל התורים יסונכרנו אוטומטית ללוח השנה שלך בגוגל.
                            </p>
                        </div>
                        
                        {isLoading && <LoadingSpinner />}
                        {isError && <ErrorMessage error={error} />}
                        
                        {!isLoading && !isError && clinics && (
                            <div className="space-y-4">
                                <p className="text-gray-600 text-sm mb-3">
                                    חבר את חשבון Google Calendar לכל מרפאה:
                                </p>
                                <div className="space-y-3">
                                    {clinics.map((clinic) => {
                                        const isConnected = !!clinic.google_calendar_id;
                                        const isConnecting = connectingClinic === clinic.id;
                                        
                                        return (
                                            <Card key={clinic.id} className="border">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Calendar className="w-5 h-5 text-gray-500" />
                                                            <div>
                                                                <h3 className="font-medium text-gray-900">{clinic.name}</h3>
                                                                {isConnected && (
                                                                    <p className="text-sm text-gray-500">{clinic.google_calendar_id}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2">
                                                            {isConnected ? (
                                                                <>
                                                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                                                        <Check className="w-3 h-3 ml-1" />
                                                                        מחובר
                                                                    </Badge>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleDisconnectCalendar(clinic.id)}
                                                                        className="text-red-600 hover:text-red-700"
                                                                    >
                                                                        <X className="w-4 h-4 ml-1" />
                                                                        נתק
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <Button
                                                                    onClick={() => handleConnectCalendar(clinic.id)}
                                                                    disabled={isConnecting}
                                                                    className="bg-blue-600 hover:bg-blue-700"
                                                                >
                                                                    {isConnecting ? (
                                                                        <>
                                                                            <LoadingSpinner size="sm" className="ml-2" />
                                                                            מתחבר...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Calendar className="w-4 h-4 ml-1" />
                                                                            חבר Google Calendar
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarClock className="w-5 h-5 text-blue-600" />
                            <span>הגדרות תיאום תורים</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 text-sm mb-4">
                            פתחו או סגרו את אפשרות תיאום התורים האונליין עבור כל מרפאה:
                        </p>
                        {!isLoading && !isError && clinics && (
                            <div className="space-y-3">
                                {clinics.map((clinic) => {
                                    const isEnabled = clinic.settings?.allow_appointments !== false;
                                    return (
                                        <Card key={clinic.id} className="border">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <CalendarClock className={`w-5 h-5 ${isEnabled ? 'text-green-500' : 'text-gray-400'}`} />
                                                        <div>
                                                            <h3 className="font-medium text-gray-900">{clinic.name}</h3>
                                                            <p className="text-sm text-gray-500">
                                                                {isEnabled ? 'פתוח לתורים אונליין' : 'סגור לתורים אונליין'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={isEnabled ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                                                            {isEnabled ? 'פתוח' : 'סגור'}
                                                        </Badge>
                                                        <Switch
                                                            checked={isEnabled}
                                                            onCheckedChange={(checked) => handleToggleAppointments(clinic.id, checked)}
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}