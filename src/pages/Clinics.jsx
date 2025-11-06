import React, { useState, useEffect } from "react";
import { Clinic } from "@/entities/Clinic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2,
  MapPin,
  Phone,
  Mail,
  Check,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export default function ClinicsPage() {
  const [clinics, setClinics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    is_active: true
  });

  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    setIsLoading(true);
    try {
      const clinicsData = await Clinic.list("-created_date");
      setClinics(clinicsData);
    } catch (error) {
      console.error("Error loading clinics:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClinic) {
        await Clinic.update(editingClinic.id, formData);
      } else {
        await Clinic.create(formData);
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadClinics();
    } catch (error) {
      console.error("Error saving clinic:", error);
      alert("אירעה שגיאה בשמירת המרפאה");
    }
  };

  const handleEdit = (clinic) => {
    setEditingClinic(clinic);
    setFormData({
      name: clinic.name,
      address: clinic.address || "",
      phone: clinic.phone || "",
      email: clinic.email || "",
      is_active: clinic.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (clinicId) => {
    if (confirm("האם אתה בטוח שברצונך למחוק את המרפאה?")) {
      try {
        await Clinic.delete(clinicId);
        loadClinics();
      } catch (error) {
        console.error("Error deleting clinic:", error);
        alert("אירעה שגיאה במחיקת המרפאה");
      }
    }
  };

  const toggleActive = async (clinic) => {
    try {
      await Clinic.update(clinic.id, { ...clinic, is_active: !clinic.is_active });
      loadClinics();
    } catch (error) {
      console.error("Error updating clinic status:", error);
    }
  };

  const resetForm = () => {
    setEditingClinic(null);
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
      is_active: true
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">ניהול מרפאות</h1>
            <p className="text-slate-600">הוספה ועריכה של מרפאות במערכת</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white">
                <Plus className="w-4 h-4 ml-2" />
                מרפאה חדשה
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>
                  {editingClinic ? "עריכת מרפאה" : "הוספת מרפאה חדשה"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">שם המרפאה *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-2"
                    placeholder="לדוגמה: מודיעין"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">כתובת</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="mt-2"
                    placeholder="כתובת המרפאה"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">טלפון</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="mt-2"
                    placeholder="09-1234567"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">אימייל</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-2"
                    placeholder="clinic@example.com"
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    ביטול
                  </Button>
                  <Button type="submit">
                    {editingClinic ? "עדכן" : "הוסף"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Clinics Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="border-b border-blue-100">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-500" />
              רשימת מרפאות ({clinics.length})
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="text-right">שם המרפאה</TableHead>
                    <TableHead className="text-right">כתובת</TableHead>
                    <TableHead className="text-right">טלפון</TableHead>
                    <TableHead className="text-right">אימייל</TableHead>
                    <TableHead className="text-right">סטטוס</TableHead>
                    <TableHead className="text-right">תאריך יצירה</TableHead>
                    <TableHead className="text-right">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 bg-slate-200 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 bg-slate-200 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 bg-slate-200 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 bg-slate-200 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-6 bg-slate-200 rounded-full animate-pulse w-16" /></TableCell>
                        <TableCell><div className="h-4 bg-slate-200 rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-8 bg-slate-200 rounded animate-pulse w-20" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    clinics.map((clinic) => (
                      <TableRow key={clinic.id} className="hover:bg-blue-50/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold">
                              {clinic.name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <span className="font-medium text-slate-800">{clinic.name}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{clinic.address || "לא צוין"}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span>{clinic.phone || "לא צוין"}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span>{clinic.email || "לא צוין"}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={`border cursor-pointer ${
                              clinic.is_active 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-red-100 text-red-800 border-red-200'
                            }`}
                            onClick={() => toggleActive(clinic)}
                          >
                            {clinic.is_active ? (
                              <>
                                <Check className="w-3 h-3 ml-1" />
                                פעיל
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3 ml-1" />
                                לא פעיל
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-sm text-slate-600">
                            {clinic.created_date ? 
                              format(new Date(clinic.created_date), "d MMM yyyy", { locale: he }) : 
                              "לא זמין"
                            }
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEdit(clinic)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4 ml-1" />
                              עריכה
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(clinic.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 ml-1" />
                              מחיקה
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {!isLoading && clinics.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">לא נמצאו מרפאות</h3>
              <p className="text-slate-500 mb-6">התחל בהוספת המרפאה הראשונה למערכת</p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white"
              >
                <Plus className="w-4 h-4 ml-2" />
                הוסף מרפאה ראשונה
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}