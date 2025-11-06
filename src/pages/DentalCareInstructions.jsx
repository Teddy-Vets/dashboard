import React, { useState, useEffect } from "react";
import { DentalCareInstructions as Instruction, Clinic } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  FileText, Plus, Eye, Send, Clock, CheckCircle, Search, Filter, Loader2, Edit, Archive, Copy, Share2, Download
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { createPageUrl, copyToClipboard, shareViaWhatsApp, shareViaEmail } from "@/components/utils/urlHelpers";
import { motion, AnimatePresence } from "framer-motion";
import userService from "@/components/services/userService";
import { getEntityList } from "@/components/utils/apiHelpers";
import { createFormLink } from "@/functions/createFormLink";
import { generateDentalCareInstructionsPDF } from "@/functions/generateDentalCareInstructionsPDF";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { TableSkeleton } from "@/components/common/LoadingSkeleton";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";

export default function DentalCareInstructionsPage() {
  const navigate = useNavigate();
  const [instructions, setInstructions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
      const filters = user.role === 'admin' ? {} : { clinic_id: user.clinic_id };
      const data = await getEntityList(Instruction, filters, "-created_date");
      setInstructions(data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const statusConfig = {
    draft: { label: "טיוטה", color: "bg-gray-100 text-gray-800", icon: Edit },
    published: { label: "מוכן לשליחה", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
    sent: { label: "נשלח", color: "bg-green-100 text-green-800", icon: Send },
    archived: { label: "בארכיון", color: "bg-red-100 text-red-800", icon: Archive }
  };

  const filteredInstructions = instructions.filter(inst => {
    const matchesSearch = searchQuery === "" ||
      inst.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.pet_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || inst.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendLink = async (form) => {
    setIsGenerating(form.id);
    setDialogState({ open: false, url: null, error: null, formId: null });
    try {
      const linkResponse = await createFormLink({
        form_type: 'dental_care_instructions',
        clinic_id: form.clinic_id,
        form_id: form.id,
        metadata: { owner_name: form.owner_name, pet_name: form.pet_name }
      });
      const token = linkResponse.data?.token;
      if (!token) throw new Error("לא התקבל טוקן מהשרת.");
      const url = `${window.location.origin}/ViewDentalCareInstructions?t=${token}`;
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
      const response = await generateDentalCareInstructionsPDF({ instructionId: form.id });
      if (response.data) {
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dental-care-instructions-${form.pet_name}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        throw new Error("Failed to generate PDF. Empty response.");
      }
    } catch (err) {
      console.error("Error downloading PDF:", err);
      // Here you could set an error state to show a message to the user
    } finally {
      setIsGenerating(null);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage error={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="הנחיות טיפול שיניים"
          description="יצירה וניהול של הנחיות טיפול שיניים"
          actionLabel="הנחיה חדשה"
          actionIcon={Plus}
          onAction={() => navigate(createPageUrl("CreateDentalCareInstructions"))}
        />
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="חיפוש לפי בעלים או חיית מחמד..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(statusConfig).map(([statusKey, { label }]) => (
              <Button key={statusKey} variant={statusFilter === statusKey ? "default" : "outline"} onClick={() => setStatusFilter(statusKey)} size="sm">{label}</Button>
            ))}
             <Button variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")} size="sm">הכל</Button>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader>
            <CardTitle>רשימת הנחיות ({filteredInstructions.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>בעלים</TableHead>
                    <TableHead>חיית מחמד</TableHead>
                    <TableHead>תאריך</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead>פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableSkeleton rows={5} columns={5} />
                </TableBody>
              </Table>
            ) : filteredInstructions.length === 0 ? (
              <EmptyState title="לא נמצאו הנחיות" description="נסה לשנות את הסינון או ליצור הנחיה חדשה." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>בעלים</TableHead>
                    <TableHead>חיית מחמד</TableHead>
                    <TableHead>תאריך</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead className="text-center">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredInstructions.map((inst, index) => {
                      const config = statusConfig[inst.status] || {};
                      return (
                        <motion.tr key={inst.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}>
                          <TableCell>{inst.owner_name}</TableCell>
                          <TableCell>{inst.pet_name}</TableCell>
                          <TableCell>{inst.procedure_date ? format(new Date(inst.procedure_date), 'd MMMM yyyy', { locale: he }) : 'לא צוין'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`${config.color} gap-1`}>
                              {config.icon && <config.icon className="w-3 h-3" />}
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex justify-center gap-2">
                             <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl('ViewDentalCareInstructions', { id: inst.id }))}><Eye className="w-4 h-4" /></Button>
                             <Button variant="ghost" size="sm" onClick={() => handleSendLink(inst)} disabled={isGenerating === inst.id}>
                               {isGenerating === inst.id && isGenerating !== dialogState.formId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-blue-600" />}
                             </Button>
                             <Button variant="ghost" size="sm" onClick={() => handleDownloadPdf(inst)} disabled={isGenerating === inst.id}>
                               {isGenerating === inst.id && isGenerating !== dialogState.formId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-green-600" />}
                             </Button>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogState.open} onOpenChange={(open) => !open && setDialogState({ open: false, url: null, error: null, formId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הקישור מוכן</DialogTitle>
            <DialogDescription>
              {dialogState.error ? `שגיאה ביצירת הקישור: ${dialogState.error}` : "ניתן להעתיק את הקישור או לשתף ישירות."}
            </DialogDescription>
          </DialogHeader>
          {dialogState.url && (
            <div className="space-y-4">
              <Input value={dialogState.url} readOnly />
              <div className="flex gap-2">
                <Button onClick={() => copyToClipboard(dialogState.url)} className="flex-1 gap-2"><Copy className="w-4 h-4" />העתק</Button>
                <Button onClick={() => shareViaWhatsApp(dialogState.url, 'הנחיות טיפול שיניים')} className="flex-1 gap-2" variant="outline">WhatsApp <Share2 className="w-4 h-4" /></Button>
                <Button onClick={() => shareViaEmail(dialogState.url, 'הנחיות טיפול שיניים')} className="flex-1 gap-2" variant="outline">אימייל <Share2 className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}