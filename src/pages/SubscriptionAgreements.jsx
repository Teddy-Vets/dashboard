import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Eye, Send, Copy, Loader2, FileText, Clock, Shield, PawPrint, User, Download } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { createFormLink } from "@/functions/createFormLink";
import { generateSubscriptionAgreementPDF } from "@/functions/generateSubscriptionAgreementPDF";
import { copyToClipboard } from "@/components/utils/urlHelpers";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import userService from "@/components/services/userService";
import { Link } from "react-router-dom";

const PLAN_LABELS = {
  teddy_basic: "טדי בייסיק",
  teddy_plus: "טדי פלוס",
  teddy_platinum: "טדי פלטינום",
  teddy_royal: "טדי רויאל",
  teddy_insured: "טדי בטוח",
};

const statusConfig = {
  pending: { label: "ממתין לחתימה", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  signed: { label: "נחתם", color: "bg-blue-100 text-blue-800 border-blue-200", icon: FileText },
  legally_sealed: { label: "חתום משפטית", color: "bg-purple-100 text-purple-800 border-purple-200", icon: Shield },
};

export default function SubscriptionAgreementsPage() {
  const [agreements, setAgreements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [generatingLinkId, setGeneratingLinkId] = useState(null);
  const [generatedLinks, setGeneratedLinks] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [exportingPdfId, setExportingPdfId] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await userService.getCurrentUser();
      setCurrentUser(user);
      let data;
      if (user.role === "admin") {
        data = await base44.entities.SubscriptionAgreement.list("-created_date", 200);
      } else {
        data = await base44.entities.SubscriptionAgreement.filter({ clinic_id: user.clinic_id }, "-created_date", 200);
      }
      setAgreements(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const generateLink = async (agreementId) => {
    setGeneratingLinkId(agreementId);
    try {
      const agreement = agreements.find(a => a.id === agreementId);
      const response = await createFormLink({
        form_type: 'subscription_agreement',
        clinic_id: agreement.clinic_id,
        form_id: agreement.id,
        metadata: { owner_name: agreement.owner_name, pet_name: agreement.pet_name }
      });
      const token = response.data?.token;
      if (!token) throw new Error("לא הצלחנו ליצור קישור");
      const url = `${window.location.origin}/PublicSubscriptionAgreement?t=${token}`;
      setGeneratedLinks(prev => ({ ...prev, [agreementId]: url }));
    } catch (e) {
      alert("שגיאה ביצירת קישור. נסו שוב.");
    } finally {
      setGeneratingLinkId(null);
    }
  };

  const exportPDF = async (agreementId) => {
    setExportingPdfId(agreementId);
    try {
      const response = await generateSubscriptionAgreementPDF({ agreement_id: agreementId });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscription_agreement_${agreementId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("שגיאה בייצוא PDF. נסו שוב.");
    } finally {
      setExportingPdfId(null);
    }
  };

  const filtered = agreements.filter(a =>
    !searchQuery ||
    a.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.pet_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">הסכמי הצטרפות למנויים</h1>
            <p className="text-slate-600 text-sm mt-1">ניהול הסכמי הצטרפות לתוכנית המנויים</p>
          </div>
          <Link to="/CreateSubscriptionAgreement">
            <Button className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              <Plus className="ml-2 h-4 w-4" />
              הסכם חדש
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <Card className="bg-white/80 border-yellow-100 shadow">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500">ממתינים לחתימה</p>
                <p className="text-2xl font-bold text-yellow-600">{agreements.filter(a => a.status === 'pending').length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400 opacity-70" />
            </CardContent>
          </Card>
          <Card className="bg-white/80 border-purple-100 shadow">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500">חתומים משפטית</p>
                <p className="text-2xl font-bold text-purple-600">{agreements.filter(a => a.status === 'legally_sealed').length}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-400 opacity-70" />
            </CardContent>
          </Card>
          <Card className="bg-white/80 border-green-100 shadow col-span-2 md:col-span-1">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500">סה״כ הסכמים</p>
                <p className="text-2xl font-bold text-green-600">{agreements.length}</p>
              </div>
              <FileText className="w-8 h-8 text-green-400 opacity-70" />
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-white/80 shadow mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="חיפוש לפי שם לקוח או חיה..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pr-10" />
            </div>
          </CardContent>
        </Card>

        {/* Table - Desktop */}
        <Card className="hidden md:block bg-white/80 shadow">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              הסכמים ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
            ) : filtered.length === 0 ? (
              <EmptyState icon={FileText} title="אין הסכמים להצגה" description="צרו הסכם חדש כדי להתחיל" actionLabel="הסכם חדש" onAction={() => window.location.href = '/CreateSubscriptionAgreement'} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-right">לקוח</TableHead>
                    <TableHead className="text-right">חיית מחמד</TableHead>
                    <TableHead className="text-right">מסלול</TableHead>
                    <TableHead className="text-right">תשלום</TableHead>
                    <TableHead className="text-right">סטטוס</TableHead>
                    <TableHead className="text-right">נוצר</TableHead>
                    <TableHead className="text-right">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filtered.map((a, i) => {
                      const config = statusConfig[a.status] || statusConfig.pending;
                      const StatusIcon = config.icon;
                      const link = generatedLinks[a.id];
                      const isGenerating = generatingLinkId === a.id;
                      return (
                        <motion.tr key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-blue-50/40 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {a.owner_name?.[0]?.toUpperCase() || "?"}
                              </div>
                              <span className="font-medium text-slate-800">{a.owner_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <PawPrint className="w-4 h-4 text-orange-500" />
                              <span>{a.pet_name}</span>
                            </div>
                          </TableCell>
                          <TableCell><span className="text-slate-700">{PLAN_LABELS[a.selected_plan] || a.selected_plan}</span></TableCell>
                          <TableCell><span className="text-sm text-slate-600">{a.payment_frequency === 'annual' ? 'שנתי' : 'חודשי'}</span></TableCell>
                          <TableCell>
                            <Badge className={`${config.color} border flex items-center gap-1 w-fit`}>
                              <StatusIcon className="w-3 h-3" />{config.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-slate-500">
                              {a.created_date ? format(new Date(a.created_date), "d MMM, HH:mm", { locale: he }) : '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2 flex-wrap">
                                {a.status === 'legally_sealed' ? (
                                  <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-50" onClick={() => window.open(`/ViewSubscriptionAgreement?id=${a.id}`, '_blank')}>
                                    <Eye className="w-4 h-4 ml-1" />צפייה
                                  </Button>
                                ) : (
                                  !link && (
                                    <Button variant="ghost" size="sm" onClick={() => generateLink(a.id)} disabled={isGenerating} className="text-purple-600 hover:bg-purple-50">
                                      {isGenerating ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Send className="w-4 h-4 ml-1" />}
                                      שלח לחתימה
                                    </Button>
                                  )
                                )}
                                <Button variant="ghost" size="sm" onClick={() => exportPDF(a.id)} disabled={exportingPdfId === a.id} className="text-slate-600 hover:bg-slate-50">
                                  {exportingPdfId === a.id ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Download className="w-4 h-4 ml-1" />}
                                  PDF
                                </Button>
                              </div>
                              {link && (
                                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded max-w-xs">
                                  <Input readOnly value={link} className="text-xs h-7 flex-grow bg-white" />
                                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyToClipboard(link)}>
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
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

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          ) : filtered.map((a, i) => {
            const config = statusConfig[a.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const link = generatedLinks[a.id];
            const isGenerating = generatingLinkId === a.id;
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <Badge className={`${config.color} border text-xs flex items-center gap-1`}><StatusIcon className="w-3 h-3" />{config.label}</Badge>
                </div>
                <div className="space-y-1 mb-3 text-sm">
                  <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /><span className="font-medium">{a.owner_name}</span></div>
                  <div className="flex items-center gap-2"><PawPrint className="w-4 h-4 text-orange-500" /><span>{a.pet_name}</span></div>
                  <div className="text-slate-500">{PLAN_LABELS[a.selected_plan]} · {a.payment_frequency === 'annual' ? 'שנתי' : 'חודשי'}</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {a.status === 'legally_sealed' ? (
                    <Button variant="ghost" size="sm" className="flex-1 text-purple-600" onClick={() => window.open(`/ViewSubscriptionAgreement?id=${a.id}`, '_blank')}>
                      <Eye className="w-4 h-4 ml-1" />צפייה
                    </Button>
                  ) : !link && (
                    <Button variant="ghost" size="sm" className="flex-1 text-purple-600" onClick={() => generateLink(a.id)} disabled={isGenerating}>
                      {isGenerating ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Send className="w-4 h-4 ml-1" />}
                      שלח לחתימה
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => exportPDF(a.id)} disabled={exportingPdfId === a.id} className="text-slate-600 hover:bg-slate-50">
                    {exportingPdfId === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  </Button>
                </div>
                {link && (
                  <div className="mt-2 flex items-center gap-2 bg-slate-50 p-2 rounded">
                    <Input readOnly value={link} className="text-xs h-7 flex-grow bg-white" />
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyToClipboard(link)}><Copy className="w-3 h-3" /></Button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}