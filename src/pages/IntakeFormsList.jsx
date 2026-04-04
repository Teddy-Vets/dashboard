import React, { useState, useEffect } from "react";
import { IntakeForm, Clinic } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Plus,
  Eye,
  Send,
  Clock,
  CheckCircle,
  Search,
  Filter,
  Loader2,
  Edit,
  Archive,
  Copy,
  Share2,
  User,
  PawPrint,
  Trash2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl, copyToClipboard, shareViaWhatsApp, shareViaEmail } from "@/components/utils/urlHelpers";
import { motion, AnimatePresence } from "framer-motion";

import userService from "@/components/services/userService";
import { getEntityList, ApiError, updateEntity } from "@/components/utils/apiHelpers";
import { createFormLink } from "@/functions/createFormLink";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { TableSkeleton } from "@/components/common/LoadingSkeleton";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

export default function IntakeFormsListPage() {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clinics, setClinics] = useState([]);

  const [generatingLink, setGeneratingLink] = useState({ id: null, url: null, error: null });
  const [deleteFormId, setDeleteFormId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await userService.getCurrentUser();
      setCurrentUser(user);

      if (user.role === 'admin') {
        const [formsData, clinicsData] = await Promise.all([
          getEntityList(IntakeForm, {}, "-created_date", null, 'IntakeForm'),
          getEntityList(Clinic, { is_active: true })
        ]);
        setForms(formsData || []);
        setClinics(clinicsData || []);
      } else {
        const formsData = await getEntityList(IntakeForm, { clinic_id: user.clinic_id }, "-created_date", null, 'IntakeForm');
        setForms(formsData || []);
      }
    } catch (error) {
      console.error("Error loading intake forms:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const statusConfig = {
    draft: { label: "טיוטה (נשלח)", color: "bg-gray-100 text-gray-800", icon: Send },
    submitted: { label: "ממתין לבדיקה", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    reviewed: { label: "נבדק", color: "bg-blue-100 text-blue-800", icon: Edit },
    completed: { label: "הושלם", color: "bg-green-100 text-green-800", icon: CheckCircle },
    archived: { label: "בארכיון", color: "bg-red-100 text-red-800", icon: Archive }
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = searchQuery === "" ||
      form.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.pet_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || form.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStats = () => {
    const total = forms.length;
    const submitted = forms.filter(f => f.status === 'submitted').length;
    const draft = forms.filter(f => f.status === 'draft').length;
    return { total, submitted, draft };
  };

  const handleSendLink = async (form) => {
    setGeneratingLink({ id: form.id, url: null, error: null });
    
    try {
      const linkResponse = await createFormLink({
        form_type: 'intake',
        clinic_id: form.clinic_id,
        form_id: form.id,
        metadata: {
          owner_name: form.owner_name,
          pet_name: form.pet_name
        }
      });
      
      const token = linkResponse.data?.token;
      if (!token) throw new Error("לא התקבל טוקן מהשרת");

      const url = `${window.location.origin}/PublicForm?t=${token}`;
      setGeneratingLink({ id: form.id, url: url, error: null });

    } catch (err) {
      console.error("Error generating link:", err);
      setGeneratingLink({ id: form.id, url: null, error: err.message });
    }
  };

  const handleDelete = async () => {
    if (!deleteFormId) return;
    setIsDeleting(true);
    await IntakeForm.delete(deleteFormId);
    setForms(prev => prev.filter(f => f.id !== deleteFormId));
    setDeleteFormId(null);
    setIsDeleting(false);
  };

  const viewForm = (form) => {
    navigate(createPageUrl('ViewIntakeForm', { id: form.id }));
  };

  // Mobile Card Component
  const IntakeFormMobileCard = ({ form, index }) => {
    const config = statusConfig[form.status] || statusConfig.draft;
    const StatusIcon = config.icon;
    const isGenerating = generatingLink.id === form.id && !generatingLink.url && !generatingLink.error;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-lg border-2 border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <Badge className={`${config.color} border text-xs flex items-center gap-1`}>
            <StatusIcon className="w-3 h-3" />
            {config.label}
          </Badge>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium text-gray-800 text-sm">{form.owner_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="text-gray-700 text-sm">{form.pet_name} ({form.pet_type})</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {format(new Date(form.created_date), "d MMM yyyy, HH:mm", { locale: he })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => viewForm(form)}
            className="flex-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <Eye className="w-4 h-4 ml-1" />
            צפייה
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(createPageUrl("EditIntakeForm", { id: form.id }))}
            className="flex-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
          >
            <Edit className="w-4 h-4 ml-1" />
            ערוך
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteFormId(form.id)}
            className="flex-1 text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 ml-1" />
            מחק
          </Button>
          {form.status === 'draft' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSendLink(form)}
              disabled={isGenerating}
              className="flex-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin ml-1" />
              ) : (
                <Send className="w-4 h-4 ml-1" />
              )}
              שלח קישור
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <PageHeader title="טפסי היכרות" />
        <ErrorMessage error={error} onRetry={loadData} />
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsive */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            טפסי היכרות
          </h1>
          <p className="text-sm md:text-base text-slate-600">
            ניהול, צפייה ושליחה של טפסי היכרות ללקוחות חדשים
          </p>
        </div>

        {/* Stats - Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 md:p-6">
              <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">ממתינים לבדיקה</p>
              <p className="text-xs text-slate-500 mb-2">טפסים שהוגשו וטרם נבדקו</p>
              <p className="text-2xl md:text-3xl font-bold text-yellow-600">
                {isLoading ? <LoadingSpinner size="sm" /> : stats.submitted}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 md:p-6">
              <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">טפסים שנשלחו</p>
              <p className="text-xs text-slate-500 mb-2">קישורים שנשלחו ללקוחות</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-600">
                {isLoading ? <LoadingSpinner size="sm" /> : stats.draft}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 md:p-6">
              <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">סה״כ טפסים</p>
              <p className="text-xs text-slate-500 mb-2">כל טפסי ההיכרות במערכת</p>
              <p className="text-2xl md:text-3xl font-bold text-green-600">
                {isLoading ? <LoadingSpinner size="sm" /> : stats.total}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters - Responsive */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg mb-4 md:mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Filter className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
              סינון וחיפוש
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="חיפוש לפי בעלים או חיית מחמד..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 text-sm md:text-base"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(statusConfig).map(([statusKey, { label }]) => (
                  <Button
                    key={statusKey}
                    variant={statusFilter === statusKey ? "default" : "outline"}
                    onClick={() => setStatusFilter(statusKey)}
                    size="sm"
                    className="text-xs md:text-sm"
                  >
                    {label}
                  </Button>
                ))}
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                  size="sm"
                  className="text-xs md:text-sm"
                >
                  הכל
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forms List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : !filteredForms.length ? (
          <EmptyState
            icon={FileText}
            title="לא נמצאו טפסי היכרות"
            description={searchQuery || statusFilter !== "all" 
              ? "נסו לשנות את מונחי החיפוש"
              : "עדיין לא נוצרו טפסים. לחצו על הכפתור כדי ליצור טופס חדש."}
            actionLabel="הוסף טופס היכרות"
            onAction={() => navigate(createPageUrl("IntakeForm"))}
          />
        ) : currentUser?.role === 'admin' ? (
          clinics.map(clinic => {
            const clinicForms = filteredForms.filter(form => form.clinic_id === clinic.id);
            if (clinicForms.length === 0) return null;

            return (
              <div key={clinic.id} className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{clinic.name}</h2>
                
                {/* Mobile View - Cards */}
                <div className="md:hidden space-y-3">
                    {clinicForms.map((form, index) => (
                      <IntakeFormMobileCard key={form.id} form={form} index={index} />
                    ))}
                </div>

                {/* Desktop View - Table */}
                <Card className="hidden md:block bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-6 h-6 text-blue-500" />
                      רשימת טפסי היכרות ({clinicForms.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>בעלים וחיית מחמד</TableHead>
                            <TableHead>תאריך יצירה</TableHead>
                            <TableHead>סטטוס</TableHead>
                            <TableHead>פעולות</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clinicForms.map((form, index) => {
                              const config = statusConfig[form.status] || {};
                              const StatusIcon = config.icon;
                              const isGenerating = generatingLink.id === form.id && !generatingLink.url && !generatingLink.error;

                              return (
                                <motion.tr key={form.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}>
                                  <TableCell className="text-right">
                                    <p className="font-medium">{form.owner_name}</p>
                                    <p className="text-sm text-slate-500">{form.pet_name} ({form.pet_type})</p>
                                  </TableCell>
                                  <TableCell className="text-right">{format(new Date(form.created_date), "d MMM yyyy, HH:mm", { locale: he })}</TableCell>
                                  <TableCell className="text-right">
                                    <Badge variant="secondary" className={`${config.color} gap-1`}>
                                      {StatusIcon && <StatusIcon className="w-3 h-3" />}
                                      {config.label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex gap-2">
                                      <Button variant="ghost" size="sm" onClick={() => viewForm(form)}><Eye className="w-4 h-4 ml-1" />צפייה</Button>
                                      <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl("EditIntakeForm", { id: form.id }))} className="text-amber-600 hover:text-amber-800 hover:bg-amber-50"><Edit className="w-4 h-4 ml-1" />ערוך</Button>
                                      <Button variant="ghost" size="sm" onClick={() => setDeleteFormId(form.id)} className="text-red-600 hover:text-red-800 hover:bg-red-50"><Trash2 className="w-4 h-4 ml-1" />מחק</Button>
                                      {form.status === 'draft' && (
                                        <Button variant="ghost" size="sm" onClick={() => handleSendLink(form)} disabled={isGenerating}>
                                          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <Send className="w-4 h-4 ml-1" />}
                                          שלח קישור
                                        </Button>
                                      )}
                                      </div>
                                  </TableCell>
                                </motion.tr>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })
        ) : (
          <>
            {/* View for non-admin user */}
            <div className="md:hidden space-y-3">
              <AnimatePresence>
                {filteredForms.map((form, index) => (
                  <IntakeFormMobileCard key={form.id} form={form} index={index} />
                ))}
              </AnimatePresence>
            </div>
            <Card className="hidden md:block bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-500" />
                  רשימת טפסי היכרות ({filteredForms.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">בעלים וחיית מחמד</TableHead>
                        <TableHead className="text-right">תאריך יצירה</TableHead>
                        <TableHead className="text-right">סטטוס</TableHead>
                        <TableHead className="text-right">פעולות</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredForms.map((form, index) => {
                          const config = statusConfig[form.status] || {};
                          const StatusIcon = config.icon;
                          const isGenerating = generatingLink.id === form.id && !generatingLink.url && !generatingLink.error;

                          return (
                            <motion.tr key={form.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}>
                              <TableCell>
                                <p className="font-medium">{form.owner_name}</p>
                                <p className="text-sm text-slate-500">{form.pet_name} ({form.pet_type})</p>
                              </TableCell>
                              <TableCell>{format(new Date(form.created_date), "d MMM yyyy, HH:mm", { locale: he })}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={`${config.color} gap-1`}>
                                  {StatusIcon && <StatusIcon className="w-3 h-3" />}
                                  {config.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => viewForm(form)}><Eye className="w-4 h-4 ml-1" />צפייה</Button>
                                  <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl("EditIntakeForm", { id: form.id }))} className="text-amber-600 hover:text-amber-800 hover:bg-amber-50"><Edit className="w-4 h-4 ml-1" />ערוך</Button>
                                  <Button variant="ghost" size="sm" onClick={() => setDeleteFormId(form.id)} className="text-red-600 hover:text-red-800 hover:bg-red-50"><Trash2 className="w-4 h-4 ml-1" />מחק</Button>
                                  {form.status === 'draft' && (
                                    <Button variant="ghost" size="sm" onClick={() => handleSendLink(form)} disabled={isGenerating}>
                                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <Send className="w-4 h-4 ml-1" />}
                                      שלח קישור
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteFormId} onOpenChange={(open) => { if (!open) setDeleteFormId(null); }}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>מחיקת טופס היכרות</AlertDialogTitle>
              <AlertDialogDescription>
                האם אתה בטוח שברצונך למחוק את הטופס? פעולה זו אינה ניתנת לביטול.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row-reverse gap-2">
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Trash2 className="w-4 h-4 ml-2" />}
                מחק
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={!!generatingLink.url || !!generatingLink.error} onOpenChange={() => setGeneratingLink({ id: null, url: null, error: null })}>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>{generatingLink.error ? 'שגיאה' : 'קישור נוצר בהצלחה!'}</DialogTitle>
              <DialogDescription>
                {generatingLink.error 
                  ? `אירעה שגיאה ביצירת הקישור: ${generatingLink.error}`
                  : 'ניתן להעתיק את הקישור ולשלוח אותו ללקוח.'
                }
              </DialogDescription>
            </DialogHeader>
            {generatingLink.url && (
              <div className="flex items-center space-x-2 space-x-reverse mt-4">
                <Input id="link" value={generatingLink.url} readOnly />
                <Button size="icon" onClick={() => copyToClipboard(generatingLink.url)}><Copy className="h-4 w-4" /></Button>
              </div>
            )}
            <DialogFooter className="mt-4">
              <Button onClick={() => shareViaWhatsApp(generatingLink.url, `שלום, נא למלא את טופס ההיכרות למרפאה:`)} disabled={!generatingLink.url}>
                <Share2 className="w-4 h-4 ml-2"/>שתף בוואטסאפ
              </Button>
              <Button onClick={() => setGeneratingLink({ id: null, url: null, error: null })}>סגור</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}