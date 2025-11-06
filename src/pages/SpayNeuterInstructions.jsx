
import React, { useState, useEffect } from "react";
import { SpayNeuterInstructions } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Scissors,
  Plus,
  Eye,
  Send,
  Clock,
  CheckCircle,
  Calendar,
  PawPrint,
  Search,
  Filter,
  AlertCircle,
  Archive
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/components/utils/urlHelpers";
import { motion, AnimatePresence } from "framer-motion";
import { formatDateTimeInIsrael } from "@/components/utils/dateUtils";

import userService from "@/components/services/userService";
import { getEntityList, ApiError } from "@/components/utils/apiHelpers";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { TableSkeleton } from "@/components/common/LoadingSkeleton";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

export default function SpayNeuterInstructionsPage() {
  const [instructions, setInstructions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await userService.getCurrentUser();
      setCurrentUser(user);

      let instructionsData;
      if (user.role === "admin") {
        instructionsData = await getEntityList(SpayNeuterInstructions, {}, "-created_date", null, 'SpayNeuterInstructions');
      } else {
        if (!user.clinic_id) {
          throw new ApiError('משתמש לא משויך למרפאה', 400);
        }
        instructionsData = await getEntityList(SpayNeuterInstructions, { clinic_id: user.clinic_id }, "-created_date", null, 'SpayNeuterInstructions');
      }
      
      setInstructions(instructionsData);
    } catch (error) {
      console.error("Error loading spay/neuter instructions:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const statusConfig = {
    draft: {
      label: "טיוטה",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: AlertCircle
    },
    published: {
      label: "מפורסם",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle
    },
    sent: {
      label: "נשלח",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Send
    },
    archived: {
      label: "בארכיון",
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: Archive
    }
  };

  const filteredInstructions = instructions.filter(instruction => {
    const matchesSearch = searchQuery === "" ||
      instruction.pet_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instruction.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instruction.surgery_type?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || instruction.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStats = () => {
    return {
      total: instructions.length,
      draft: instructions.filter(i => i.status === 'draft').length,
      published: instructions.filter(i => i.status === 'published').length,
      sent: instructions.filter(i => i.status === 'sent').length,
      // archived: instructions.filter(i => i.status === 'archived').length // Uncomment if needed for stats
    };
  };
  
  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="הנחיות עיקור/סירוס"
            description="שגיאה בטעינת הנתונים"
          />
          <ErrorMessage error={error} onRetry={loadData} />
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="הנחיות עיקור/סירוס"
          description={
            currentUser?.role === "admin"
              ? "ניהול הנחיות עיקור וסירוס לכל המרפאות"
              : "יצירה וניהול של הנחיות עיקור וסירוס למרפאה"
          }
          actionLabel="הנחיה חדשה"
          actionIcon={Plus}
          onAction={() => navigate(createPageUrl("CreateSpayNeuterInstructions"))}
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">סה״כ</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {isLoading ? <LoadingSpinner size="sm" /> : stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-yellow-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">טיוטות</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {isLoading ? <LoadingSpinner size="sm" /> : stats.draft}
                  </p>
                </div>
                <AlertCircle className="w-12 h-12 text-yellow-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">מפורסמים</p>
                  <p className="text-3xl font-bold text-green-600">
                    {isLoading ? <LoadingSpinner size="sm" /> : stats.published}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">נשלחו</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {isLoading ? <LoadingSpinner size="sm" /> : stats.sent}
                  </p>
                </div>
                <Send className="w-12 h-12 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-500" />
              סינון וחיפוש
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="חיפוש לפי בעלים, חיית מחמד או סוג ניתוח..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>

              <div className="flex gap-2">
                <Button variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")} size="sm">הכל</Button>
                <Button variant={statusFilter === "draft" ? "default" : "outline"} onClick={() => setStatusFilter("draft")} size="sm">טיוטות</Button>
                <Button variant={statusFilter === "published" ? "default" : "outline"} onClick={() => setStatusFilter("published")} size="sm">מפורסמים</Button>
                <Button variant={statusFilter === "sent" ? "default" : "outline"} onClick={() => setStatusFilter("sent")} size="sm">נשלחו</Button>
                {/* Archive filter button, if you choose to enable it in the UI
                <Button variant={statusFilter === "archived" ? "default" : "outline"} onClick={() => setStatusFilter("archived")} size="sm">בארכיון</Button>
                */}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="border-b border-blue-100">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Scissors className="w-6 h-6 text-pink-500" />
              הנחיות עיקור/סירוס ({filteredInstructions.length})
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            {!isLoading && filteredInstructions.length === 0 ? (
              <EmptyState
                icon={Scissors}
                title={searchQuery || statusFilter !== "all" 
                  ? "לא נמצאו הנחיות התואמות לחיפוש"
                  : "אין הנחיות להצגה"}
                description="ניתן ליצור הנחיית עיקור/סירוס חדשה"
                actionLabel="הוסף הנחיה"
                onAction={() => navigate(createPageUrl("CreateSpayNeuterInstructions"))}
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead>בעלים</TableHead>
                      <TableHead>חיית מחמד</TableHead>
                      <TableHead>סוג ניתוח</TableHead>
                      <TableHead>תאריך</TableHead>
                      <TableHead>גרסה</TableHead>
                      <TableHead>סטטוס</TableHead>
                      <TableHead>פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {isLoading ? (
                        <TableSkeleton rows={5} columns={7} />
                      ) : (
                        filteredInstructions.map((instruction, index) => {
                          const config = statusConfig[instruction.status] || statusConfig.draft;
                          const StatusIcon = config.icon;
                          
                          return (
                            <motion.tr key={instruction.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} className="hover:bg-blue-50/50">
                              <TableCell>{instruction.owner_name}</TableCell>
                              <TableCell>{instruction.pet_name}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={instruction.surgery_type === 'עיקור' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'}>
                                  {instruction.surgery_type}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDateTimeInIsrael(instruction.surgery_date, "d MMM yyyy")}</TableCell>
                              <TableCell>
                                <span className="text-sm font-mono text-slate-600">
                                  v{instruction.version_number || 1}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={`${config.color} flex items-center gap-1 w-fit`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {config.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Link to={createPageUrl('ViewSpayNeuterInstructions', { id: instruction.id })}>
                                  <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-100">
                                    <Eye className="w-4 h-4 ml-1" />
                                    צפייה
                                  </Button>
                                </Link>
                              </TableCell>
                            </motion.tr>
                          );
                        })
                      )}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
