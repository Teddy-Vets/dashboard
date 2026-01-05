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

export default function ClinicSettings() {
    const queryClient = useQueryClient();

    const { data: clinics, isLoading, isError, error } = useQuery({
        queryKey: ['clinics'],
        queryFn: getClinics,
    });

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
                             <div className="overflow-x-auto">
                                <p className="text-gray-600 text-sm">
                                    רשימת המרפאות שלך ({clinics.length}):
                                </p>
                                <ul className="mt-2 space-y-2">
                                    {clinics.map((clinic) => (
                                        <li key={clinic.id} className="p-2 bg-gray-50 rounded">
                                            {clinic.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}