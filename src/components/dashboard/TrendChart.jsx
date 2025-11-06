import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building2, FileText, Heart } from "lucide-react";

export default function TrendChart({ forms, clinics, currentUser }) {
  const getClinicStats = () => {
    if (!forms || !clinics) return [];
    
    const isAdmin = currentUser?.role === 'admin';
    const relevantClinics = isAdmin ? clinics : clinics.filter(c => c.id === currentUser?.clinic_id);
    
    return relevantClinics.map(clinic => {
      // חלוקת הטפסים לפי סוג
      const intakeForms = forms.filter(form => 
        form.clinic_id === clinic.id && 
        (form.visit_reason_main || form.first_visit !== undefined) // זיהוי טפסי היכרות
      );
      
      const consentForms = forms.filter(form => 
        form.clinic_id === clinic.id && 
        (form.procedure_type || form.owner_name) && // זיהוי טפסי הכנה לניתוח
        !form.visit_reason_main && form.first_visit === undefined
      );
      
      return {
        id: clinic.id,
        name: clinic.name,
        intakeCount: intakeForms.length,
        consentCount: consentForms.length,
        total: intakeForms.length + consentForms.length
      };
    }).sort((a, b) => b.total - a.total); // מיון לפי סה"כ טפסים (מהגבוה לנמוך)
  };

  const data = getClinicStats();

  if (data.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            טפסים לפי מרפאות
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-slate-500">אין נתונים להצגה</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-500" />
          טפסים לפי מרפאות
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-right">מרפאה</TableHead>
                <TableHead className="text-right">טפסי היכרות</TableHead>
                <TableHead className="text-right">טפסי הכנה לניתוח</TableHead>
                <TableHead className="text-right">סה״כ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((clinic) => (
                <TableRow key={clinic.id} className="hover:bg-blue-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-800">{clinic.name}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                        {clinic.intakeCount}
                      </Badge>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-purple-500" />
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                        {clinic.consentCount}
                      </Badge>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="default" className="bg-slate-800 text-white font-bold">
                      {clinic.total}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}