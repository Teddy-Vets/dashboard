
import React, { useState, useEffect } from "react";
import { ConsentForm } from "@/entities/all";
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
  Calendar,
  PawPrint,
  Search,
  Filter,
  Copy,
  Loader2,
  FileCheck, // Added FileCheck icon
  Shield, // Added Shield icon
  User // NEW: Added User icon for mobile card
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl, copyToClipboard } from "@/components/utils/urlHelpers";
import { motion, AnimatePresence } from "framer-motion";

import userService from "@/components/services/userService";
import { getEntityList, ApiError } from "@/components/utils/apiHelpers";
import { createFormLink } from "@/functions/createFormLink";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { TableSkeleton } from "@/components/common/LoadingSkeleton";
// import PageHeader from "@/components/common/PageHeader"; // Removed as it's replaced by custom responsive header
import EmptyState from "@/components/common/EmptyState";

// NEW: Utility function for date formatting (assuming it's not already globally available or in another utility file)
const formatDateTimeInIsrael = (dateString, formatStr = "dd/MM/yyyy HH:mm") => {
    if (!dateString) return "";
    try {
        return format(new Date(dateString), formatStr, { locale: he });
    } catch (e) {
        console.error("Error formatting date:", e);
        return dateString; // Return original if parsing fails
    }
};

export default function ConsentFormsPage() {
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // State for link generation
  const [generatingLinkId, setGeneratingLinkId] = useState(null);
  const [generatedLinks, setGeneratedLinks] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedLinks({}); // Reset links on reload
    
    try {
      const user = await userService.getCurrentUser();
      setCurrentUser(user);

      let formsData;
      if (user.role === "admin") {
        formsData = await getEntityList(ConsentForm, {}, "-created_date", null, 'ConsentForm');
      } else {
        if (!user.clinic_id) {
          throw new ApiError('משתמש לא משויך למרפאה', 400);
        }
        formsData = await getEntityList(ConsentForm, { clinic_id: user.clinic_id }, "-created_date", null, 'ConsentForm');
      }
      
      setForms(formsData);
    } catch (error) {
      console.error("Error loading consent forms:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const statusConfig = {
    pending: {
      label: "ממתין לחתימה",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock
    },
    signed: {
      label: "נחתם",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: CheckCircle
    },
    completed: {
      label: "הושלם",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: FileCheck // Changed icon to FileCheck
    },
    legally_sealed: { // New status
      label: "חתום משפטית", // Updated label from "אטום משפטית"
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: Shield // New icon Shield
    }
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = searchQuery === "" ||
      form.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.pet_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.procedure_type?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || form.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStats = () => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    const pendingForms = forms.filter(f => f.status === "pending").length;
    const signedToday = forms.filter(f => 
      f.status === "signed" &&
      f.signed_at &&
      format(new Date(f.signed_at), "yyyy-MM-dd") === todayStr
    ).length;
    
    return {
      totalForms: forms.length,
      pendingForms,
      signedToday
    };
  };

  const generateAndStoreLink = async (formId) => {
    setGeneratingLinkId(formId);
    try {
      const form = forms.find(f => f.id === formId);
      if (!form) {
        throw new Error("טופס לא נמצא.");
      }

      const response = await createFormLink({
        form_type: 'consent',
        clinic_id: form.clinic_id,
        form_id: form.id,
        metadata: {
          owner_name: form.owner_name,
          pet_name: form.pet_name,
          procedure_type: form.procedure_type,
        }
      });

      const token = response.data?.token;
      if (!token) {
        throw new Error("לא הצלחנו ליצור קישור מאובטח");
      }

      const publicUrl = `${window.location.origin}/PublicConsentForm?t=${token}`;
      setGeneratedLinks(prev => ({ ...prev, [formId]: publicUrl }));
      
    } catch (err) {
      console.error('Failed to generate consent link:', err);
      alert("שגיאה ביצירת הקישור. אנא נסו שוב.");
    } finally {
      setGeneratingLinkId(null);
    }
  };
  
  const handleCopy = async (text) => {
    try {
        await copyToClipboard(text);
        // The user can verify if the copy was successful by checking the clipboard.
    } catch (error) {
        console.error("Failed to copy to clipboard:", error);
    }
  };

  const viewConsentForm = async (formId) => {
    try {
      const form = forms.find(f => f.id === formId);
      if (!form) {
        throw new Error("טופס לא נמצא.");
      }

      // אם הטופס חתום (חתום, הושלם, או חתום משפטית) - נפתח דף צפייה ייעודי בתוך המערכת
      if (form.status === 'legally_sealed' || form.status === 'signed' || form.status === 'completed') {
        window.open(createPageUrl("ViewConsentForm", { id: form.id }), "_blank");
        return;
      }

      // אם הטופס עדיין ממתין - נפתח את הטופס הציבורי לחתימה
      // If link already generated and stored, use it.
      // This prevents regenerating the token for viewing if it already exists for copying/sending.
      if (generatedLinks[formId]) {
        window.open(generatedLinks[formId], "_blank");
        return;
      }

      // If not, generate it first, then view.
      const response = await createFormLink({
        form_type: 'consent',
        clinic_id: form.clinic_id,
        form_id: form.id,
        metadata: {
          owner_name: form.owner_name,
          pet_name: form.pet_name,
          procedure_type: form.procedure_type,
        }
      });

      const token = response.data?.token;
      if (!token) {
        throw new Error("לא הצלחנו ליצור קישור לצפיה");
      }

      const publicUrl = `${window.location.origin}/PublicConsentForm?t=${token}`;
      setGeneratedLinks(prev => ({ ...prev, [formId]: publicUrl })); // Store the link even if viewing
      window.open(publicUrl, "_blank");
    } catch (err) {
      console.error('Failed to view consent form:', err);
      alert("שגיאה בפתיחת הטופס לצפיה. אנא נסו שוב.");
    }
  };

  // Mobile Card Component
  const ConsentFormMobileCard = ({ form, index }) => {
    const config = statusConfig[form.status] || statusConfig.pending;
    const StatusIcon = config.icon;
    const generatedLink = generatedLinks[form.id];
    const isGenerating = generatingLinkId === form.id;

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
            <span className="font-medium text-gray-800 text-sm">{form.owner_name || '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="text-gray-700 text-sm">{form.pet_name || '-'}</span>
          </div>
          <div className="text-xs text-gray-600">
            {form.procedure_type}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {form.created_date && formatDateTimeInIsrael(form.created_date, 'dd/MM/yy HH:mm')}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => viewConsentForm(form.id)}
              className="flex-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <Eye className="w-4 h-4 ml-1" />
              צפייה
            </Button>
            {form.status === "pending" && !generatedLink && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => generateAndStoreLink(form.id)}
                disabled={isGenerating}
                className="flex-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Send className="w-4 h-4 ml-1" />}
                שלח קישור
              </Button>
            )}
          </div>
          {generatedLink && (
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-md">
              <Input
                type="text"
                readOnly
                value={generatedLink}
                className="text-xs h-8 flex-grow bg-white"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => handleCopy(generatedLink)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Custom responsive header for error state */}
          <div className="mb-4 md:mb-6 flex justify-between items-center">
              <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
                      טופסי הכנה לניתוח
                  </h1>
                  <p className="text-sm md:text-base text-slate-600">
                      שגיאה בטעינת הנתונים
                  </p>
              </div>
          </div>
          <ErrorMessage error={error} onRetry={loadData} />
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsive */}
        <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">
              טופסי הכנה לניתוח
            </h1>
            <p className="text-sm md:text-base text-slate-600">
              {currentUser?.role === "admin"
                ? "ניהול וטיפול בטופסי הכנה לניתוח מכל המרפאות"
                : "ניהול וטיפול בטופסי הכנה לניתוח של המרפאה שלך"}
            </p>
          </div>
          <Button
            className="mt-4 md:mt-0 w-full md:w-auto"
            onClick={() => window.open(createPageUrl("CreateConsentForm"), "_self")}
          >
            <Plus className="ml-2 h-4 w-4" />
            טופס הכנה לניתוח חדש
          </Button>
        </div>

        {/* Stats - Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border-yellow-100 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">ממתינים לחתימה</p>
                  <p className="text-xs text-slate-500 mb-2">טפסים שנשלחו וממתינים</p>
                  <p className="text-2xl md:text-3xl font-bold text-yellow-600">
                    {isLoading ? <LoadingSpinner size="sm" /> : stats.pendingForms}
                  </p>
                </div>
                <Clock className="w-8 h-8 md:w-12 md:h-12 text-yellow-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">נחתמו היום</p>
                  <p className="text-xs text-slate-500 mb-2">טפסים שנחתמו ב-24 שעות</p>
                  <p className="text-2xl md:text-3xl font-bold text-blue-600">
                    {isLoading ? <LoadingSpinner size="sm" /> : stats.signedToday}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 md:w-12 md:h-12 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-green-100 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">סה״כ טפסים</p>
                  <p className="text-xs text-slate-500 mb-2">כל טפסי ההסכמה</p>
                  <p className="text-2xl md:text-3xl font-bold text-green-600">
                    {isLoading ? <LoadingSpinner size="sm" /> : stats.totalForms}
                  </p>
                </div>
                <FileText className="w-8 h-8 md:w-12 md:h-12 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters - Responsive */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg mb-4 md:mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
              <Filter className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
              סינון וחיפוש
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="חיפוש לפי בעלים, חיית מחמד או הליך..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>

              <div className="flex gap-2 flex-wrap justify-end">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                  size="sm"
                  className="flex-grow md:flex-grow-0"
                >
                  הכל
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  onClick={() => setStatusFilter("pending")}
                  size="sm"
                  className="flex-grow md:flex-grow-0"
                >
                  ממתינים
                </Button>
                <Button
                  variant={statusFilter === "signed" ? "default" : "outline"}
                  onClick={() => setStatusFilter("signed")}
                  size="sm"
                  className="flex-grow md:flex-grow-0"
                >
                  נחתמו
                </Button>
                <Button
                  variant={statusFilter === "completed" ? "default" : "outline"}
                  onClick={() => setStatusFilter("completed")}
                  size="sm"
                  className="flex-grow md:flex-grow-0"
                >
                  הושלמו
                </Button>
                <Button
                  variant={statusFilter === "legally_sealed" ? "default" : "outline"}
                  onClick={() => setStatusFilter("legally_sealed")}
                  size="sm"
                  className="flex-grow md:flex-grow-0"
                >
                  אטומים משפטית
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forms List */}
        {!isLoading && filteredForms.length === 0 && (
          <EmptyState
            icon={FileText}
            title={searchQuery || statusFilter !== "all" 
              ? "לא נמצאו טפסים התואמים לקריטריונים שנבחרו"
              : "אין טפסי הכנה לניתוח להצגה"}
            description="נסו לשנות את מונחי החיפוש או להוסיף טופס חדש"
            actionLabel="הוסף טופס הכנה לניתוח"
            onAction={() => window.open(createPageUrl("CreateConsentForm"), "_self")}
          />
        )}

        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-3">
          <AnimatePresence>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              filteredForms.map((form, index) => (
                <ConsentFormMobileCard key={form.id} form={form} index={index} />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Desktop View - Table */}
        <Card className="hidden md:block bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="border-b border-blue-100">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-500" />
              רשימת טופסי הכנה לניתוח ({filteredForms.length})
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="text-right">בעלים</TableHead>
                    <TableHead className="text-right">חיית מחמד</TableHead>
                    <TableHead className="text-right">הליך</TableHead>
                    <TableHead className="text-right">תאריך הליך</TableHead>
                    <TableHead className="text-right">סטטוס</TableHead>
                    <TableHead className="text-right">נוצר</TableHead>
                    <TableHead className="text-right">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <TableSkeleton rows={5} columns={7} />
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredForms.map((form, index) => {
                        const config = statusConfig[form.status] || statusConfig.pending;
                        const StatusIcon = config.icon;
                        const generatedLink = generatedLinks[form.id];
                        const isGenerating = generatingLinkId === form.id;
                        
                        return (
                          <motion.tr
                            key={form.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-blue-50/50 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                                  {form.owner_name?.[0]?.toUpperCase() || "?"}
                                </div>
                                <div>
                                  <p className="font-medium text-slate-800">{form.owner_name}</p>
                                  <p className="text-sm text-slate-500">{form.owner_email}</p>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <PawPrint className="w-4 h-4 text-orange-500" />
                                <span className="font-medium text-slate-700">{form.pet_name}</span>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <span className="text-slate-700">{form.procedure_type}</span>
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600">
                                  {form.procedure_date
                                    ? format(new Date(form.procedure_date), "d MMM yyyy", { locale: he })
                                    : "לא נקבע"}
                                </span>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={`${config.color} border flex items-center gap-1 w-fit`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {config.label}
                              </Badge>
                            </TableCell>
                            
                            <TableCell>
                              <span className="text-sm text-slate-600">
                                {form.created_date
                                  ? format(new Date(form.created_date), "d MMM, HH:mm", { locale: he })
                                  : "לא זמין"}
                              </span>
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex flex-col gap-2 items-start">
                                <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                      onClick={() => viewConsentForm(form.id)}
                                    >
                                      <Eye className="w-4 h-4 ml-1" />
                                      צפייה
                                    </Button>
                                    {form.status === "pending" && !generatedLink && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => generateAndStoreLink(form.id)}
                                        disabled={isGenerating}
                                        className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                                      >
                                        {isGenerating ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Send className="w-4 h-4 ml-1" />}
                                        שלח קישור
                                      </Button>
                                    )}
                                </div>
                                 {generatedLink && (
                                  <div className="mt-2 flex items-center gap-2 bg-slate-100 p-1 rounded-md w-full max-w-xs">
                                      <Input
                                          type="text"
                                          readOnly
                                          value={generatedLink}
                                          className="text-xs h-8 flex-grow bg-white"
                                      />
                                      <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-8 w-8 flex-shrink-0"
                                          onClick={() => handleCopy(generatedLink)}
                                      >
                                          <Copy className="w-4 h-4" />
                                      </Button>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
