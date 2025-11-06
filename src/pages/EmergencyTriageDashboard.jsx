
import React, { useState, useEffect } from "react";
import { EmergencyTriage } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle,
  Phone,
  Eye,
  Filter,
  Search,
  Share2,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  MapPin,
  User,
  PawPrint
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils/urlHelpers";
import { formatDateTimeInIsrael } from "@/components/utils/dateUtils";
import { motion, AnimatePresence } from "framer-motion";

import userService from "@/components/services/userService";
import { getEntityList } from "@/components/utils/apiHelpers";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { TableSkeleton } from "@/components/common/LoadingSkeleton";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

export default function EmergencyTriageDashboard() {
  const [triages, setTriages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await userService.getCurrentUser();
      setCurrentUser(user);

      let triagesData;
      if (user.role === "admin") {
        triagesData = await getEntityList(EmergencyTriage, {}, "-created_date", null, 'EmergencyTriage');
      } else {
        if (!user.clinic_id) {
          throw new Error('משתמש לא משויך למרפאה');
        }
        triagesData = await getEntityList(
          EmergencyTriage,
          { clinic_id: user.clinic_id },
          "-created_date",
          null,
          'EmergencyTriage'
        );
      }

      setTriages(triagesData);
    } catch (err) {
      console.error("Error loading emergency triages:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const severityConfig = {
    RED: { label: "חירום קריטי", color: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle },
    ORANGE: { label: "דחוף", color: "bg-orange-100 text-orange-800 border-orange-200", icon: Clock },
    YELLOW: { label: "מעקב ביתי", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
    GREEN: { label: "רגיל", color: "bg-green-100 text-green-800 border-green-200", icon: Clock }
  };

  const statusConfig = {
    draft: { label: "טיוטה", color: "bg-gray-100 text-gray-800" },
    submitted: { label: "הוגש", color: "bg-blue-100 text-blue-800" },
    contacted: { label: "נוצר קשר", color: "bg-indigo-100 text-indigo-800" },
    arrived: { label: "הגיע למרפאה", color: "bg-green-100 text-green-800" },
    cancelled: { label: "בוטל", color: "bg-red-100 text-red-800" }
  };


  const filteredTriages = triages.filter(triage => {
    const matchesSearch = searchQuery === "" ||
      triage.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      triage.pet_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      triage.owner_phone?.includes(searchQuery);

    const matchesSeverity = severityFilter === "all" || triage.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const getStats = () => {
    const red = triages.filter(t => t.severity === 'RED' && t.status !== 'cancelled').length;
    const orange = triages.filter(t => t.severity === 'ORANGE' && t.status !== 'cancelled').length;
    const pending = triages.filter(t => t.status === 'submitted').length;

    return { red, orange, pending, total: triages.length };
  };

  const TriageMobileCard = ({ triage, index }) => {
    const config = severityConfig[triage.severity] || severityConfig.GREEN;
    const statusConf = statusConfig[triage.status] || statusConfig.draft;
    const SeverityIcon = config.icon;

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
            <SeverityIcon className="w-3 h-3" />
            {config.label}
          </Badge>
          <Badge className={`${statusConf.color} text-xs`}>
            {statusConf.label}
          </Badge>
        </div>

        {/* Owner & Pet Info */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium text-gray-800 text-sm">{triage.owner_name || 'לא צוין'}</span>
          </div>
          <div className="flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="text-gray-700 text-sm">{triage.pet_name || 'לא צוין'} ({triage.pet_species || '-'})</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <a href={`tel:${triage.owner_phone}`} className="text-blue-600 text-sm hover:underline">
              {triage.owner_phone}
            </a>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {formatDateTimeInIsrael(triage.created_date, 'dd/MM/yy HH:mm')}
          </div>
        </div>

        {/* Action Button */}
        <Link to={createPageUrl("ViewEmergencyTriage", { id: triage.id })} className="block">
          <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-800 hover:bg-blue-50">
            <Eye className="w-4 h-4 ml-1" />
            צפייה מלאה
          </Button>
        </Link>
      </motion.div>
    );
  };


  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            פניות חירום - טריאז'
          </h1>
          <p className="text-sm md:text-base text-slate-600">
            שגיאה בטעינת הנתונים
          </p>
        </div>
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
            פניות חירום - טריאז'
          </h1>
          <p className="text-sm md:text-base text-slate-600">
            ניהול ומעקב אחר פניות חירום ודחופות
          </p>
        </div>

        {/* Stats - Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border-red-100 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">חירום קריטי</p>
                  <p className="text-xs text-slate-500">דורש טיפול מיידי</p>
                </div>
                <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-red-500 opacity-80" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-red-600">
                {isLoading ? <LoadingSpinner size="sm" /> : stats.red}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-100 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">דחוף</p>
                  <p className="text-xs text-slate-500">טיפול בתוך שעות</p>
                </div>
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-orange-500 opacity-80" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-orange-600">
                {isLoading ? <LoadingSpinner size="sm" /> : stats.orange}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-yellow-100 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">ממתינים</p>
                  <p className="text-xs text-slate-500">טרם נוצר קשר</p>
                </div>
                <Phone className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 opacity-80" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-yellow-600">
                {isLoading ? <LoadingSpinner size="sm" /> : stats.pending}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">סה״כ פניות</p>
                  <p className="text-xs text-slate-500">כל הפניות היום</p>
                </div>
                <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-blue-500 opacity-80" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-blue-600">
                {isLoading ? <LoadingSpinner size="sm" /> : stats.total}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters - Responsive */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg mb-4 md:mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="חיפוש לפי בעלים, חיית מחמד או טלפון..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>

              {/* Severity filter as buttons for mobile/desktop flexibility */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={severityFilter === "all" ? "default" : "outline"}
                  onClick={() => setSeverityFilter("all")}
                  size="sm"
                  className="text-xs md:text-sm"
                >
                  הכל
                </Button>
                <Button
                  variant={severityFilter === "RED" ? "default" : "outline"}
                  onClick={() => setSeverityFilter("RED")}
                  size="sm"
                  className="text-xs md:text-sm"
                >
                  קריטי
                </Button>
                <Button
                  variant={severityFilter === "ORANGE" ? "default" : "outline"}
                  onClick={() => setSeverityFilter("ORANGE")}
                  size="sm"
                  className="text-xs md:text-sm"
                >
                  דחוף
                </Button>
                <Button
                  variant={severityFilter === "YELLOW" ? "default" : "outline"}
                  onClick={() => setSeverityFilter("YELLOW")}
                  size="sm"
                  className="text-xs md:text-sm"
                >
                  מעקב
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forms List - Mobile Cards / Desktop stays as is */}
        {!isLoading && filteredTriages.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title={searchQuery || severityFilter !== "all"
              ? "לא נמצאו פניות התואמות לקריטריונים שנבחרו"
              : "אין פניות חירום להצגה"}
            description="כל הפניות יופיעו כאן"
          />
        ) : (
          <>
            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-3">
              <AnimatePresence>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : (
                  filteredTriages.map((triage, index) => (
                    <TriageMobileCard key={triage.id} triage={triage} index={index} />
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Desktop View - Table */}
            <Card className="hidden md:block bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
              <CardHeader className="border-b border-blue-100">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  רשימת פניות חירום ({filteredTriages.length})
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="text-right">מזהה</TableHead>
                        <TableHead className="text-right">בעלים</TableHead>
                        <TableHead className="text-right">חיית מחמד</TableHead>
                        <TableHead className="text-right">דחיפות</TableHead>
                        <TableHead className="text-right">תגי סיכון</TableHead>
                        <TableHead className="text-right">תאריך פנייה</TableHead>
                        <TableHead className="text-right">סטטוס</TableHead>
                        <TableHead className="text-right">פעולות</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="wait">
                        {isLoading ? (
                          <TableSkeleton rows={5} columns={8} />
                        ) : (
                          filteredTriages.map((triage, index) => {
                            const severityConf = severityConfig[triage.severity] || severityConfig.GREEN;
                            const statusConf = statusConfig[triage.status] || statusConfig.draft;
                            const SeverityIcon = severityConf.icon;

                            return (
                              <motion.tr
                                key={triage.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-blue-50/50 transition-colors"
                              >
                                <TableCell>
                                  <span className="font-mono text-xs text-slate-500">
                                    {triage.id.substring(0, 8)}...
                                  </span>
                                </TableCell>

                                <TableCell>
                                  <div>
                                    <p className="font-medium text-slate-800">
                                      {triage.owner_name || "לא צוין"}
                                    </p>
                                    <p className="text-sm text-slate-500">{triage.owner_phone}</p>
                                  </div>
                                </TableCell>

                                <TableCell>
                                  <div>
                                    <p className="font-medium text-slate-700">
                                      {triage.pet_name || "לא צוין"}
                                    </p>
                                    <p className="text-sm text-slate-500">{triage.pet_species}</p>
                                  </div>
                                </TableCell>

                                <TableCell>
                                  <Badge
                                    variant="secondary"
                                    className={`${severityConf.color} border flex items-center gap-1 w-fit`}
                                  >
                                    <SeverityIcon className="w-3 h-3" />
                                    {severityConf.label}
                                  </Badge>
                                </TableCell>

                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {triage.risk_tags && triage.risk_tags.length > 0 ? (
                                      triage.risk_tags.slice(0, 2).map((tag, i) => (
                                        <Badge
                                          key={i}
                                          variant="outline"
                                          className="text-xs bg-amber-50 text-amber-700 border-amber-200"
                                        >
                                          {tag}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-xs text-slate-400">אין</span>
                                    )}
                                    {triage.risk_tags && triage.risk_tags.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{triage.risk_tags.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>

                                <TableCell>
                                  <span className="text-sm text-slate-600">
                                    {triage.created_date
                                      ? formatDateTimeInIsrael(triage.created_date, "dd MMM, HH:mm")
                                      : "לא זמין"}
                                  </span>
                                </TableCell>

                                <TableCell>
                                  <Badge
                                    variant="secondary"
                                    className={`${statusConf.color} border flex items-center gap-1 w-fit`}
                                  >
                                    {statusConf.label}
                                  </Badge>
                                </TableCell>

                                <TableCell>
                                  <div className="flex gap-2">
                                    <Link to={createPageUrl("ViewEmergencyTriage", { id: triage.id })}>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                      >
                                        <Eye className="w-4 h-4 ml-1" />
                                        צפייה
                                      </Button>
                                    </Link>

                                    {triage.owner_phone && (
                                      <a href={`tel:${triage.owner_phone}`}>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                        >
                                          <Phone className="w-4 h-4 ml-1" />
                                          התקשר
                                        </Button>
                                      </a>
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
          </>
        )}
      </div>
    </div>
  );
}
