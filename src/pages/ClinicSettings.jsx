import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Power, PowerOff, Settings } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { TableSkeleton } from '@/components/common/LoadingSkeleton';
import { toast } from 'sonner';

const getClinics = async () => {
    return await base44.entities.Clinic.list();
};



const disconnectAuth = async (clinicId) => {
    return await base44.entities.Clinic.update(clinicId, {
        google_calendar_access_token: null,
        google_calendar_refresh_token: null,
        google_calendar_id: null,
        google_calendar_last_sync: null,
    });
};

export default function ClinicSettings() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const success = urlParams.get('success');

        if (error) {
            toast.error(`An error occurred during Google Calendar synchronization: ${decodeURIComponent(error)}`);
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (success) {
            toast.success('Google Calendar connected successfully!');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const { data: clinics, isLoading, isError, error } = useQuery({
        queryKey: ['clinics'],
        queryFn: getClinics,
    });

    const initiateAuthMutation = useMutation({
        mutationFn: async (clinicId) => {
            const { data, error } = await base44.functions.invoke('initiateGoogleAuth', { clinicId });
            if (error) {
                console.error("invoke error", error);
                throw new Error(error.details || 'Failed to initiate auth');
            }
            return data;
        },
        onSuccess: (data) => {
            if (data && data.authorizationUrl) {
                toast.info('Redirecting to Google for authentication...');
                window.location.href = data.authorizationUrl;
            } else {
                toast.error('Could not get authorization URL.');
            }
        },
        onError: (error) => {
            console.error('Failed to initiate auth:', error);
            toast.error('Failed to start Google Calendar connection: ' + error.message);
        },
    });

    const disconnectAuthMutation = useMutation({
        mutationFn: disconnectAuth,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinics'] });
            toast.success('Google Calendar disconnected successfully.');
        },
        onError: (error) => {
            console.error('Failed to disconnect:', error);
            toast.error('Failed to disconnect Google Calendar: ' + error.message);
        },
    });

    const handleConnect = (clinicId) => {
        initiateAuthMutation.mutate(clinicId);
    };

    const handleDisconnect = (clinicId) => {
        disconnectAuthMutation.mutate(clinicId);
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
                        {isLoading && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>שם מרפאה</TableHead>
                                        <TableHead>סטטוס חיבור</TableHead>
                                        <TableHead>יומן מסונכרן</TableHead>
                                        <TableHead>פעולות</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableSkeleton rows={3} columns={4} />
                                </TableBody>
                            </Table>
                        )}
                        {isError && <ErrorMessage error={error} onRetry={() => queryClient.invalidateQueries({ queryKey: ['clinics'] })} />}
                        
                        {!isLoading && !isError && clinics && (
                             <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-right">שם מרפאה</TableHead>
                                            <TableHead className="text-right">סטטוס חיבור</TableHead>
                                            <TableHead className="text-right">יומן מסונכרן</TableHead>
                                            <TableHead className="text-right">פעולות</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {clinics.map((clinic) => {
                                            const isConnected = !!clinic.google_calendar_access_token;
                                            return (
                                                <TableRow key={clinic.id}>
                                                    <TableCell className="font-medium">{clinic.name}</TableCell>
                                                    <TableCell>
                                                        {isConnected ? (
                                                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                                                <Power className="w-3 h-3 ml-1" />
                                                                מחובר
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">
                                                                <PowerOff className="w-3 h-3 ml-1" />
                                                                לא מחובר
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                     <TableCell>
                                                        {clinic.google_calendar_id ? (
                                                            <a 
                                                                href={`https://calendar.google.com/calendar/u/0/r?cid=${clinic.google_calendar_id}`}
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline flex items-center gap-1"
                                                            >
                                                                {clinic.google_calendar_id}
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {isConnected ? (
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDisconnect(clinic.id)}
                                                                disabled={disconnectAuthMutation.isPending && disconnectAuthMutation.variables === clinic.id}
                                                            >
                                                                {disconnectAuthMutation.isPending && disconnectAuthMutation.variables === clinic.id ? <LoadingSpinner size="sm" /> : <PowerOff className="w-4 h-4 ml-1" />}
                                                                נתק
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() => handleConnect(clinic.id)}
                                                                disabled={initiateAuthMutation.isPending && initiateAuthMutation.variables === clinic.id}
                                                            >
                                                                 {initiateAuthMutation.isPending && initiateAuthMutation.variables === clinic.id ? <LoadingSpinner size="sm" /> : <Power className="w-4 h-4 ml-1" />}
                                                                חבר ל-Google
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}