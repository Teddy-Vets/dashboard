import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle, AlertTriangle, PawPrint, User } from "lucide-react";
import { validateLink } from '@/functions/validateLink';
import { submitRabiesDeclaration } from '@/functions/submitRabiesDeclaration';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { format } from "date-fns";
import { he } from "date-fns/locale";

export default function PublicRabiesDeclarationPage() {
  const [token, setToken] = useState('');
  const [linkData, setLinkData] = useState(null);
  const [declarationData, setDeclarationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    owner_signature: '',
    dog_is_over_3_months: false,
    is_owner_of_dog: false,
    understands_rabies_law: false,
    understands_side_effects: false,
    understands_feces_disposal: false,
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('t');
    
    if (!tokenParam) {
      setError('קישור לא תקין - חסר טוקן אימות.');
      setIsLoading(false);
      return;
    }
    
    setToken(tokenParam);
    validateToken(tokenParam);
  }, []);

  const validateToken = async (tokenValue) => {
    try {
      const { data } = await validateLink({ token: tokenValue });
      
      if (!data.valid) {
        throw new Error('הקישור אינו תקף או פג תוקפו.');
      }
      
      setLinkData(data.link);
      
      if (data.form) {
        setDeclarationData(data.form);
        // Check if already signed
        if (data.form.status === 'signed' || data.form.status === 'completed') {
          setIsSubmitted(true);
        }
      }
      
    } catch (err) {
      console.error('Token validation failed:', err);
      setError(err.message || 'שגיאה באימות הקישור.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required checkboxes
    const requiredCheckboxes = [
      'dog_is_over_3_months',
      'is_owner_of_dog', 
      'understands_rabies_law',
      'understands_side_effects',
      'understands_feces_disposal'
    ];
    
    const missingCheckboxes = requiredCheckboxes.filter(field => !formData[field]);
    if (missingCheckboxes.length > 0) {
      setError('יש לסמן את כל תיבות הסימון הנדרשות.');
      return;
    }

    if (!formData.owner_signature.trim()) {
      setError('יש להזין חתימה דיגיטלית (שם מלא).');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const submissionData = {
        token,
        form_data: {
          ...formData,
          signed_at: new Date().toISOString(),
          status: 'signed'
        }
      };
      
      const { data } = await submitRabiesDeclaration(submissionData);
      
      if (data.success) {
        setIsSubmitted(true);
      } else {
        throw new Error(data.error || 'שגיאה בשליחת ההצהרה.');
      }
      
    } catch (err) {
      console.error('Submission failed:', err);
      setError(err.message || 'אירעה שגיאה בשליחת ההצהרה. אנא נסו שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error && !linkData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-800 mb-2">שגיאה</h1>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              חזרה לדף הבית
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-800 mb-4">הצהרת הכלבת נחתמה בהצלחה!</h1>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 mb-2">
                <strong>תודה {declarationData?.owner_name || ''}!</strong>
              </p>
              <p className="text-green-700 text-sm">
                הצהרת הכלבת עבור {declarationData?.pet_name || 'חיית המחמד'} נשלחה למרפאה בהצלחה.
              </p>
            </div>
            <p className="text-slate-600 text-sm">
              תוכלו לסגור את הדף. המרפאה תקבל הודעה על חתימת ההצהרה.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        
        <Card className="mb-8 bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center border-b border-blue-100">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              הצהרת בעלות וחיסון כלבת
            </CardTitle>
            <p className="text-slate-600 mt-2">
              {linkData?.clinic_name || 'מרפאות טדי וטס'}
            </p>
          </CardHeader>

          {declarationData && (
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    פרטי הבעלים
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>שם:</strong> {declarationData.owner_name}</p>
                    <p><strong>ת.ז:</strong> {declarationData.owner_id_number}</p>
                    <p><strong>טלפון:</strong> {declarationData.owner_phone}</p>
                    {declarationData.owner_email && <p><strong>מייל:</strong> {declarationData.owner_email}</p>}
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <PawPrint className="w-4 h-4" />
                    פרטי הכלב
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>שם:</strong> {declarationData.pet_name}</p>
                    <p><strong>גזע:</strong> {declarationData.pet_breed || 'לא צוין'}</p>
                    <p><strong>שבב:</strong> {declarationData.pet_microchip}</p>
                    <p><strong>מין:</strong> {declarationData.pet_gender || 'לא צוין'}</p>
                  </div>
                </div>
              </div>

              <Alert className="mb-6 border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>חשוב:</strong> הצהרה זו נדרשת לפני מתן חיסון כלבת. אנא קראו בעיון וסמנו את כל תיבות הסימון הנדרשות.
                </AlertDescription>
              </Alert>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-4 p-6 bg-slate-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">הצהרות נדרשות</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <Checkbox 
                        id="dog_is_over_3_months"
                        checked={formData.dog_is_over_3_months}
                        onCheckedChange={(checked) => handleInputChange('dog_is_over_3_months', checked)}
                        className="mt-0.5"
                      />
                      <Label htmlFor="dog_is_over_3_months" className="text-sm font-medium text-slate-700 cursor-pointer leading-5">
                        אני מצהיר/ה בזאת שכלב זה לא נשך ולא נושך למשך 10 ימים אחרונים *
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3 space-x-reverse">
                      <Checkbox 
                        id="is_owner_of_dog"
                        checked={formData.is_owner_of_dog}
                        onCheckedChange={(checked) => handleInputChange('is_owner_of_dog', checked)}
                        className="mt-0.5"
                      />
                      <Label htmlFor="is_owner_of_dog" className="text-sm font-medium text-slate-700 cursor-pointer leading-5">
                        אני מצהיר/ה כי אני הבעלים החוקי של הכלב *
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3 space-x-reverse">
                      <Checkbox 
                        id="understands_rabies_law"
                        checked={formData.understands_rabies_law}
                        onCheckedChange={(checked) => handleInputChange('understands_rabies_law', checked)}
                        className="mt-0.5"
                      />
                      <Label htmlFor="understands_rabies_law" className="text-sm font-medium text-slate-700 cursor-pointer leading-5">
                        אני מבין/ה את חובות החוק בנוגע לכלבת (חיסון, שבב, רישיון) *
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3 space-x-reverse">
                      <Checkbox 
                        id="understands_side_effects"
                        checked={formData.understands_side_effects}
                        onCheckedChange={(checked) => handleInputChange('understands_side_effects', checked)}
                        className="mt-0.5"
                      />
                      <Label htmlFor="understands_side_effects" className="text-sm font-medium text-slate-700 cursor-pointer leading-5">
                        אני מבין/ה את תופעות הלוואי האפשריות של החיסון *
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3 space-x-reverse">
                      <Checkbox 
                        id="understands_feces_disposal"
                        checked={formData.understands_feces_disposal}
                        onCheckedChange={(checked) => handleInputChange('understands_feces_disposal', checked)}
                        className="mt-0.5"
                      />
                      <Label htmlFor="understands_feces_disposal" className="text-sm font-medium text-slate-700 cursor-pointer leading-5">
                        אני מבין/ה את חובת סילוק הפרשות של הכלב *
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="owner_signature" className="text-base font-medium text-slate-700">
                    חתימה דיגיטלית (שם מלא) *
                  </Label>
                  <Input
                    id="owner_signature"
                    value={formData.owner_signature}
                    onChange={(e) => handleInputChange('owner_signature', e.target.value)}
                    placeholder="הקלידו את שמכם המלא כחתימה דיגיטלית"
                    className="text-lg p-4"
                    required
                  />
                  <p className="text-sm text-slate-500">
                    החתימה הדיגיטלית תהווה אישור משפטי להצהרה זו
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="ml-2" />
                        שולח הצהרה...
                      </>
                    ) : (
                      'חתום ושלח הצהרה'
                    )}
                  </Button>
                </div>

              </form>
            </CardContent>
          )}
        </Card>

        <div className="text-center text-sm text-slate-500">
          <p>מערכת טפסים דיגיטליים - מרפאות טדי וטס</p>
          <p>© {new Date().getFullYear()} כל הזכויות שמורות</p>
        </div>
      </div>
    </div>
  );
}