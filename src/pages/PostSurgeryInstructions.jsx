import React, { useState, useEffect } from "react";
import { PostSurgeryInstructions as Instruction, Clinic } from "@/entities/all";
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
import { generatePostSurgeryInstructionsPDF } from "@/functions/generatePostSurgeryInstructionsPDF";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { TableSkeleton } from "@/components/common/LoadingSkeleton";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";

export default function PostSurgeryInstructionsPage() {
  const navigate = useNavigate();
  const [instructions, setInstructions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogState, setDialogState] = useState({ open: false, url: null, error: null, formId: null });
  const [isGenerating, setIsGenerating] = useState(null); // formId of the generating form

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
        form_type: 'post_surgery_instructions',
        clinic_id: form.clinic_id,
        form_id: form.id,
        metadata: { owner_name: form.owner_name, pet_name: form.pet_name }
      });
      const token = linkResponse.data?.token;
      if (!token) throw new Error("לא התקבל טוקן מהשרת.");
      const url = `${window.location.origin}/ViewPostSurgeryInstructions?t=${token}`;
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
      const response = await generatePostSurgeryInstructionsPDF({ instructionId: form.id });
      if (response.data) {
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `post-op-${form.pet_name || 'instructions'}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error(response.error || "שגיאה לא ידועה בהורדת PDF");
      }
    } catch (err) {
      setDialogState({ open: true, url: null, error: `שגיאה בהורדת PDF: ${err.message}`, formId: form.id });
    } finally {
      setIsGenerating(null);
    }
  };

  const stats = {
    total: instructions.length,
    draft: instructions.filter(f => f.status === 'draft').length,
    published: instructions.filter(f => f.status === 'published').length
  };

  if (error) return <div className="p-6"><ErrorMessage error={error} onRetry={loadData} /></div>;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="הנחיות שחרור לאחר ניתוח"
          description="ניהול, יצירה ושליחה של דפי הנחיות ללקוחות."
          actionLabel="צור הנחיות חדשות"
          actionIcon={Plus}
          onAction={() => navigate(createPageUrl("CreatePostSurgeryInstructions"))}
        />
        
        {/* ... (Stats cards - can be added later if needed) ... */}

        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg mb-6">
          <CardHeader className="pb-4"><CardTitle>סינון וחיפוש</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="חיפוש לפי בעלים או חיית מחמד..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(statusConfig).map(([statusKey, { label }]) => (
                  <Button key={statusKey} variant={statusFilter === statusKey ? "default" : "outline"} onClick={() => setStatusFilter(statusKey)} size="sm">{label}</Button>
                ))}
                <Button variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")} size="sm">הכל</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="border-b"><CardTitle>רשימת הנחיות ({filteredInstructions.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            {!isLoading && filteredInstructions.length === 0 ? (
              <EmptyState icon={FileText} title="לא נמצאו הנחיות" onAction={() => navigate(createPageUrl("CreatePostSurgeryInstructions"))} actionLabel="צור הנחיות חדשות" />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>בעלים וחיית מחמד</TableHead>
                      <TableHead>סוג ניתוח</TableHead>
                      <TableHead>תאריך יצירה</TableHead>
                      <TableHead>סטטוס</TableHead>
                      <TableHead>פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? <TableSkeleton rows={5} columns={5} /> : (
                      <AnimatePresence>
                        {filteredInstructions.map((inst, index) => {
                          const config = statusConfig[inst.status] || {};
                          return (
                            <motion.tr key={inst.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}>
                              <TableCell>
                                <p className="font-medium">{inst.owner_name}</p>
                                <p className="text-sm text-slate-500">{inst.pet_name}</p>
                              </TableCell>
                              <TableCell>{inst.surgery_type}</TableCell>
                              <TableCell>{format(new Date(inst.created_date), "d MMM yyyy", { locale: he })}</TableCell>
                              <TableCell><Badge variant="secondary" className={config.color}>{config.label}</Badge></TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl('ViewPostSurgeryInstructions', { id: inst.id }))}><Eye className="w-4 h-4" /></Button>
                                  {isGenerating === inst.id ? <Button variant="ghost" size="sm" disabled><Loader2 className="w-4 h-4 animate-spin" /></Button> : (
                                    <>
                                      <Button variant="ghost" size="sm" onClick={() => handleSendLink(inst)}><Send className="w-4 h-4" /></Button>
                                      <Button variant="ghost" size="sm" onClick={() => handleDownloadPdf(inst)}><Download className="w-4 h-4" /></Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Dialog open={dialogState.open} onOpenChange={() => setDialogState({ open: false, url: null, error: null, formId: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogState.error ? 'שגיאה' : 'קישור נוצר בהצלחה!'}</DialogTitle>
              <DialogDescription>
                {dialogState.error ? `אירעה שגיאה: ${dialogState.error}` : 'ניתן להעתיק את הקישור ולשלוח אותו ללקוח.'}
              </DialogDescription>
            </DialogHeader>
            {dialogState.url && (
              <>
                <div className="flex items-center space-x-2 space-x-reverse mt-4">
                  <Input id="link" value={dialogState.url} readOnly />
                  <Button size="icon" onClick={() => copyToClipboard(dialogState.url)}><Copy className="h-4 w-4" /></Button>
                </div>
                <DialogFooter className="mt-4 gap-2">
                   <Button onClick={() => shareViaWhatsApp(dialogState.url, `שלום, מצורפות הנחיות לאחר הניתוח:`)} disabled={!dialogState.url} className="w-full sm:w-auto">
                    <Share2 className="w-4 h-4 ml-2"/>שתף בוואטסאפ
                  </Button>
                  <Button variant="secondary" onClick={() => setDialogState({ open: false, url: null, error: null, formId: null })} className="w-full sm:w-auto">סגור</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}