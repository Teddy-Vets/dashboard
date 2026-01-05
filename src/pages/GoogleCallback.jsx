import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function GoogleCallback() {
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        // Parse URL parameters manually to ensure single processing
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        const processCallback = async () => {
            if (error) {
                setStatus('error');
                setErrorMessage(`שגיאה מגוגל: ${error}`);
                return;
            }

            if (!code || !state) {
                setStatus('error');
                setErrorMessage('חסרים פרטי זיהוי בתשובה מגוגל (code או state).');
                return;
            }

            try {
                console.log('[GoogleCallback] Exchanging code for token...');
                const { data, error: functionError } = await base44.functions.invoke('exchangeGoogleToken', {
                    code,
                    state
                });

                if (functionError) {
                    console.error("Invoke error:", functionError);
                    throw new Error(functionError.message || 'Network error invoking backend');
                }

                if (data && data.success === false) {
                    console.error("Logic error:", data);
                    let msg = data.error || 'Unknown backend error';
                    if (data.details) msg += `\nDetails: ${data.details}`;
                    if (data.debug) msg += `\nDebug Info: ${JSON.stringify(data.debug)}`;
                    throw new Error(msg);
                }

                console.log('[GoogleCallback] Success!');
                setStatus('success');
                setTimeout(() => {
                    navigate('/ClinicSettings?success=true');
                }, 2000);

            } catch (err) {
                console.error('Google Auth Error:', err);
                setStatus('error');
                setErrorMessage(err.message || 'אירעה שגיאה לא צפויה בעת החיבור.');
            }
        };

        // Only process if we actually received a code or an error
        if (code || error) {
            processCallback();
        } else {
            setStatus('error');
            setErrorMessage('לא התקבלו פרמטרים מגוגל');
        }
    }, []); // Empty dependency array to run only once

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle>חיבור ל-Google Calendar</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-6">
                    
                    {status === 'processing' && (
                        <>
                            <LoadingSpinner size="xl" className="text-blue-600" />
                            <p className="text-gray-600">מבצע חיבור ומאמת נתונים...</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="rounded-full bg-green-100 p-3">
                                <CheckCircle2 className="w-12 h-12 text-green-600" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-medium text-green-800">החיבור הצליח!</h3>
                                <p className="text-gray-600 mt-2">מעביר אותך בחזרה להגדרות...</p>
                            </div>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="rounded-full bg-red-100 p-3">
                                <AlertCircle className="w-12 h-12 text-red-600" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-medium text-red-800">החיבור נכשל</h3>
                                <p className="text-red-600 mt-2 bg-red-50 p-3 rounded text-sm whitespace-pre-wrap" style={{direction: 'ltr'}}>{errorMessage}</p>
                            </div>
                            <Button 
                                onClick={() => navigate('/ClinicSettings')}
                                variant="outline"
                                className="mt-4"
                            >
                                חזור להגדרות
                            </Button>
                        </>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}