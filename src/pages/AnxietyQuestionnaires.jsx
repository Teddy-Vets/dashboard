
import React, { useState, useEffect } from "react";
import { AnxietyQuestionnaire, Clinic } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Plus,
  Eye,
  Send,
  Search,
  Filter,
  PawPrint,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Copy,
  Share2,
  Download,
  Loader2,
  User, // Added for mobile card
  Clock // Added for mobile card
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { createPageUrl, copyToClipboard, shareViaWhatsApp, shareViaEmail } from "@/components/utils/urlHelpers";
import { motion, AnimatePresence } from "framer-motion";

import userService from "@/components/services/userService";
import { getEntityList, ApiError } from "@/components/utils/apiHelpers";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { TableSkeleton } from "@/components/common/LoadingSkeleton";
import PageHeader from "@/components/common/PageHeader"; // Kept import, though usage changed
import EmptyState from "@/components/common/EmptyState";
import { createFormLink } from "@/functions/createFormLink";
import { generateAnxietyQuestionnairePDF } from "@/functions/generateAnxietyQuestionnairePDF";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AnxietyQuestionnairesPage() {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const [dialogState, setDialogState] = useState({ open: false, url: null, error: null, formId: null });
  const [isGenerating, setIsGenerating] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await userService.getCurrentUser();
      setCurrentUser(user);

      let questionnairesData;
      if (user.role === "admin") {
        questionnairesData = await getEntityList(AnxietyQuestionnaire, {}, "-created_date", null, 'AnxietyQuestionnaire');
      } else {
        if (!user.clinic_id) {
          throw new ApiError('משתמש לא משויך למרפאה', 400);
        }
        questionnairesData = await getEntityList(AnxietyQuestionnaire, { clinic_id: user.clinic_id }, "-created_date", null, 'AnxietyQuestionnaire');
      }
      
      setQuestionnaires(questionnairesData);
    } catch (error) {
      console.error("Error loading anxiety questionnaires:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendLink = async (form) => {
    setIsGenerating(form.id);
    setDialogState({ open: false, url: null, error: null, formId: null });
    try {
      const linkResponse = await createFormLink({
        form_type: 'anxiety_questionnaire',
        clinic_id: form.clinic_id,
        form_id: form.id,
        metadata: { owner_name: form.owner_name, pet_name: form.pet_name }
      });
      const token = linkResponse.data?.token;
      if (!token) throw new Error("לא התקבל טוקן מהשרת.");
      const url = `${window.location.origin}/PublicAnxietyQuestionnaire?t=${token}`;
      setDialogState({ open: true, url, error: null, formId: form.id });
    } catch (err) {
      setDialogState({ open: true, url: null, error: err.message, formId: form.id });
    } finally {
      setIsGenerating(null);
    }
  };

  const handleDownloadPdf = async (form) => {
    setIsGenerating(form.id);
    try {
      const response = await generateAnxietyQuestionnairePDF({ questionnaire_id: form.id });
      if (response.data) {
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `anxiety-questionnaire-${form.pet_name || form.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("שגיאה בהפקת קובץ ה-PDF.");
    } finally {
      setIsGenerating(null);
    }
  };

  const statusConfig = {
    draft: { label: "טיוטה", color: "bg-gray-100 text-gray-800", icon: AlertCircle },
    completed: { label: "הושלם", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
    reviewed: { label: "נבדק", color: "bg-green-100 text-green-800", icon: CheckCircle },
    archived: { label: "בארכיון", color: "bg-slate-100 text-slate-800", icon: AlertCircle }
  };

  const getAnxietyLevel = (score) => {
    if (score === null || score === undefined) return { label: "לא חושב", color: "bg-gray-100 text-gray-800" };
    if (score <= 3) return { label: "נמוכה", color: "bg-green-100 text-green-800" };
    if (score <= 6) return { label: "בינונית", color: "bg-yellow-100 text-yellow-800" };
    return { label: "גבוהה", color: "bg-red-100 text-red-800" };
  };

  const filteredQuestionnaires = questionnaires.filter(q => {
    const matchesSearch = searchQuery === "" ||
      q.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.pet_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const AnxietyQuestionnaireMobileCard = ({ questionnaire, index }) => {
    const config = statusConfig[questionnaire.status] || statusConfig.draft;
    const StatusIcon = config.icon;
    const anxietyLevel = getAnxietyLevel(questionnaire.anxiety_score);

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
          <Badge variant="secondary" className={`${anxietyLevel.color} border text-xs`}>
            {questionnaire.anxiety_score !== null ? `${questionnaire.anxiety_score}/10` : ''} {anxietyLevel.label}
          </Badge>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium text-gray-800 text-sm">{questionnaire.owner_name || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="text-gray-700 text-sm">{questionnaire.pet_name || 'N/A'}</span>
          </div>
          {questionnaire.completed_at && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {format(new Date(questionnaire.completed_at), 'd MMM yyyy, HH:mm', { locale: he })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(createPageUrl('ViewAnxietyQuestionnaire', { id: questionnaire.id }))}
            className="flex-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <Eye className="w-4 h-4 ml-1" />
            צפייה
          </Button>
          {questionnaire.status === 'draft' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSendLink(questionnaire)}
              disabled={isGenerating === questionnaire.id}
              className="flex-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
            >
              {isGenerating === questionnaire.id ? (
                <Loader2 className="w-4 h-4 animate-spin ml-1" />
              ) : (
                <Send className="w-4 h-4 ml-1" />
              )}
              שלח
            </Button>
          )}
          {questionnaire.status === 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownloadPdf(questionnaire)}
              disabled={isGenerating === questionnaire.id}
              className="flex-1 text-green-600 hover:text-green-800 hover:bg-green-50"
            >
              {isGenerating === questionnaire.id ? (
                <Loader2 className="w-4 h-4 animate-spin ml-1" />
              ) : (
                <Download className="w-4 h-4 ml-1" />
              )}
              PDF
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage error={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsive */}
        <div className="mb-4 md:mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
              שאלוני חרדת חיות מחמד
            </h1>
            <p className="text-sm md:text-base text-slate-600">
              יצירה וניהול של שאלוני חרדה לחיות מחמד
            </p>
          </div>
          <Button 
            className="hidden md:flex items-center gap-2"
            onClick={() => navigate(createPageUrl("CreateAnxietyQuestionnaire"))}
          >
            <Plus className="w-4 h-4" />
            שאלון חרדה חדש
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => navigate(createPageUrl("CreateAnxietyQuestionnaire"))}
            title="שאלון חרדה חדש"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Add Stats Cards if needed */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 md:p-6">
              <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">סה״כ שאלונים</p>
              <p className="text-xs text-slate-500 mb-2">כל השאלונים במערכת</p>
              <p className="text-2xl md:text-3xl font-bold text-purple-600">
                {isLoading ? <LoadingSpinner size="sm" /> : questionnaires.length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 md:p-6">
              <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">הושלמו</p>
              <p className="text-xs text-slate-500 mb-2">שאלונים שמולאו ע״י לקוחות</p>
              <p className="text-2xl md:text-3xl font-bold text-green-600">
                {isLoading ? <LoadingSpinner size="sm" /> : questionnaires.filter(q => q.status === 'completed').length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 md:p-6">
              <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">חרדה גבוהה</p>
              <p className="text-xs text-slate-500 mb-2">חיות עם רמת חרדה 7+</p>
              <p className="text-2xl md:text-3xl font-bold text-red-600">
                {isLoading ? <LoadingSpinner size="sm" /> : questionnaires.filter(q => q.anxiety_score > 6).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters - Responsive */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg mb-4 md:mb-6">
          <CardHeader>
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
                  placeholder="חיפוש לפי בעלים או שם חיית מחמד..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")} size="sm">הכל</Button>
                <Button variant={statusFilter === "draft" ? "default" : "outline"} onClick={() => setStatusFilter("draft")} size="sm">טיוטות</Button>
                <Button variant={statusFilter === "completed" ? "default" : "outline"} onClick={() => setStatusFilter("completed")} size="sm">הושלמו</Button>
                <Button variant={statusFilter === "reviewed" ? "default" : "outline"} onClick={() => setStatusFilter("reviewed")} size="sm">נבדקו</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questionnaires List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : filteredQuestionnaires.length === 0 ? (
          <EmptyState
            icon={Brain}
            title="לא נמצאו שאלונים"
            description={searchQuery || statusFilter !== "all" ? "נסו לשנות את החיפוש או הסינון." : "עדיין לא נוצרו שאלוני חרדה."}
            actionLabel="צור שאלון חדש"
            onAction={() => navigate(createPageUrl("CreateAnxietyQuestionnaire"))}
          />
        ) : (
          <>
            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-3">
              <AnimatePresence>
                {filteredQuestionnaires.map((q, index) => (
                  <AnxietyQuestionnaireMobileCard key={q.id} questionnaire={q} index={index} />
                ))}
              </AnimatePresence>
            </div>

            {/* Desktop View - Table */}
            <Card className="hidden md:block bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-500" />
                  שאלוני חרדה ({filteredQuestionnaires.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead>בעלים</TableHead>
                        <TableHead>חיית מחמד</TableHead>
                        <TableHead>רמת חרדה</TableHead>
                        <TableHead>סטטוס</TableHead>
                        <TableHead>הושלם בתאריך</TableHead>
                        <TableHead>פעולות</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredQuestionnaires.map((q, index) => {
                          const config = statusConfig[q.status] || statusConfig.draft;
                          const anxietyLevel = getAnxietyLevel(q.anxiety_score);
                          return (
                            <motion.tr
                              key={q.id}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="hover:bg-blue-50/50"
                            >
                              <TableCell>{q.owner_name || 'N/A'}</TableCell>
                              <TableCell>{q.pet_name || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={`${anxietyLevel.color} border`}>
                                  {q.anxiety_score !== null ? `${q.anxiety_score}/10` : ''} {anxietyLevel.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={`${config.color} border flex items-center gap-1 w-fit`}>
                                  <config.icon className="w-3 h-3" />
                                  {config.label}
                                </Badge>
                              </TableCell>
                              <TableCell>{q.completed_at ? format(new Date(q.completed_at), 'd MMM yyyy, HH:mm', { locale: he }) : 'לא הושלם'}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('ViewAnxietyQuestionnaire', { id: q.id }))} title="צפייה">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  {q.status === 'draft' && (
                                    <Button variant="ghost" size="icon" onClick={() => handleSendLink(q)} disabled={isGenerating === q.id} title="שלח קישור ללקוח">
                                      {isGenerating === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-blue-600" />}
                                    </Button>
                                  )}
                                  {q.status === 'completed' && (
                                    <Button variant="ghost" size="icon" onClick={() => handleDownloadPdf(q)} disabled={isGenerating === q.id} title="הורד PDF">
                                      {isGenerating === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-green-600" />}
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
      </div>

      <Dialog open={dialogState.open} onOpenChange={(open) => !open && setDialogState({ open: false, url: null, error: null, formId: null })}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>הקישור המאובטח מוכן</DialogTitle>
            <DialogDescription>
              {dialogState.error ? `שגיאה: ${dialogState.error}` : "ניתן להעתיק את הקישור ולשלוח אותו ללקוח."}
            </DialogDescription>
          </DialogHeader>
          {dialogState.url && (
            <div className="bg-slate-100 p-2 rounded-md my-4">
              <p className="text-sm text-slate-700 break-all">{dialogState.url}</p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button onClick={() => copyToClipboard(dialogState.url)} disabled={!dialogState.url}>
              <Copy className="w-4 h-4 ml-2" />העתק
            </Button>
            <Button onClick={() => shareViaWhatsApp(dialogState.url)} variant="outline" disabled={!dialogState.url}>
              <Share2 className="w-4 h-4 ml-2" />שתף בוואטסאפ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
