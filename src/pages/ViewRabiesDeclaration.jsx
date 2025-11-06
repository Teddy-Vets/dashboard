
import React, { useState, useEffect, useCallback } from "react";
import { RabiesDeclaration, Clinic } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Shield, Calendar, User, PawPrint, Download, Loader2, AlertTriangle, FileText, Check, X
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/components/utils/urlHelpers";
import { formatDateInIsrael } from "@/components/utils/dateUtils";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import PageHeader from "@/components/common/PageHeader";
// import { generateRabiesDeclarationPDF } from "@/functions/generateRabiesDeclarationPDF";

const DetailItem = ({ label, value, isBoolean = false }) => (
  <div className="flex justify-between items-center py-2 border-b">
    <span className="text-slate-600">{label}</span>
    {isBoolean ? (
      value ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-600" />
    ) : (
      <span className="font-medium text-slate-800">{value || 'לא צוין'}</span>
    )}
  </div>
);

export default function ViewRabiesDeclarationPage() {
  const [declaration, setDeclaration] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const declarationId = urlParams.get('id');
  const navigate = useNavigate();

  const loadDeclaration = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const decls = await RabiesDeclaration.filter({ id: declarationId });
      if (!decls || decls.length === 0) throw new Error("ההצהרה לא נמצאה.");
      const decl = decls[0];
      setDeclaration(decl);
      if (decl.clinic_id) {
        const clinics = await Clinic.filter({ id: decl.clinic_id });
        if (clinics && clinics.length > 0) setClinic(clinics[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [declarationId]);

  useEffect(() => {
    if (declarationId) {
      loadDeclaration();
    } else {
      setError("מזהה הצהרה חסר.");
      setIsLoading(false);
    }
  }, [declarationId, loadDeclaration]);

  const handleDownload = () => {
    alert("פונקציונליות יצירת PDF תתווסף בקרוב.");
    // setIsDownloading(true);
    // try {
    //   const response = await generateRabiesDeclarationPDF({ declarationId });
    //   ...
    // } catch ...
    // setIsDownloading(false);
  };
  
  if (isLoading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="xl" /></div>;
  if (error) return <div className="p-8"><ErrorMessage error={{ message: error }} onRetry={loadDeclaration} /></div>;
  if (!declaration) return <div className="p-8 text-center">לא נמצאו נתונים.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="פרטי הצהרת כלבת"
          description={`הצהרה עבור ${declaration.pet_name}`}
          backButton={true}
          onBack={() => navigate(createPageUrl("RabiesDeclarations"))}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="md:col-span-2 bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">פרטי ההצהרה</CardTitle>
              <CardDescription>
                {`תאריך: ${formatDateInIsrael(declaration.declaration_date)} | סטטוס: `}
                <Badge className={declaration.status === 'signed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {declaration.status === 'signed' ? 'חתום' : 'ממתין לחתימה'}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {declaration.status === 'signed' && (
                <Button onClick={handleDownload} disabled={isDownloading} className="w-full">
                  {isDownloading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Download className="ml-2 h-4 w-4" />}
                  הורד PDF חתום
                </Button>
              )}
            </CardContent>
          </Card>
        
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><User />פרטי הבעלים</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <DetailItem label="שם" value={declaration.owner_name} />
              <DetailItem label="ת.ז." value={declaration.owner_id_number} />
              <DetailItem label="טלפון" value={declaration.owner_phone} />
              <DetailItem label="אימייל" value={declaration.owner_email} />
              <DetailItem label="כתובת" value={declaration.owner_address} />
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><PawPrint />פרטי הכלב</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <DetailItem label="שם" value={declaration.pet_name} />
              <DetailItem label="שבב" value={declaration.pet_microchip} />
              <DetailItem label="גזע" value={declaration.pet_breed} />
              <DetailItem label="מין" value={declaration.pet_gender} />
              <DetailItem label="ת. לידה" value={formatDateInIsrael(declaration.pet_birth_date)} />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2 bg-white/80 backdrop-blur-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText />סעיפי ההצהרה</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <DetailItem label="הכלב מעל גיל 3 חודשים" value={declaration.dog_is_over_3_months} isBoolean />
              <DetailItem label="אני הבעלים של הכלב" value={declaration.is_owner_of_dog} isBoolean />
              <DetailItem label="מבין/ה את חובות חוק הכלבת" value={declaration.understands_rabies_law} isBoolean />
              <DetailItem label="מבין/ה את תופעות הלוואי האפשריות" value={declaration.understands_side_effects} isBoolean />
              <DetailItem label="מבין/ה את חובת פינוי ההפרשות" value={declaration.understands_feces_disposal} isBoolean />
            </CardContent>
            {declaration.status === 'signed' && (
              <CardContent className="pt-4 border-t">
                 <p className="text-sm text-green-700 text-center">ההצהרה נחתמה דיגיטלית בתאריך {formatDateInIsrael(declaration.signed_at, 'dd/MM/yyyy HH:mm')}</p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
