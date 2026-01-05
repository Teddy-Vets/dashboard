import React, { useState, useEffect } from "react";
import { AppointmentRequest, Clinic } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  PawPrint,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Search,
  Filter,
  Plus,
  User // Added User icon for mobile card
} from "lucide-react";
import { formatDateTimeInIsrael } from "@/components/utils/dateUtils";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/components/utils/urlHelpers";

import userService from "@/components/services/userService";
import { getEntityList, updateEntity, ApiError } from "@/components/utils/apiHelpers";
import { base44 } from "@/api/base44Client";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { TableSkeleton } from "@/components/common/LoadingSkeleton";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

export default function ManageAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const navigate = useNavigate();

  // שדות טופס עריכה
  const [editForm, setEditForm] = useState({
    status: '',
    appointment_datetime: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await userService.getCurrentUser();
      setCurrentUser(user);

      let appointmentsData;
      if (user.role === "admin") {
        appointmentsData = await getEntityList(AppointmentRequest, {}, "-created_date", null, 'AppointmentRequest');
      } else if (user.clinic_id) {
        appointmentsData = await getEntityList(AppointmentRequest, { clinic_id: user.clinic_id }, "-created_date", null, 'AppointmentRequest');
      } else {
        appointmentsData = [];
      }

      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Error loading appointments:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const statusConfig = {
    draft: {
      label: "טיוטה",
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: Edit
    },
    submitted: {
      label: "ממתין לאישור",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock
    },
    confirmed: {
      label: "מאושר",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle
    },
    completed: {
      label: "הושלם",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: CheckCircle
    },
    cancelled: {
      label: "בוטל",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = searchQuery === "" ||
      apt.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.pet_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.owner_phone?.includes(searchQuery);

    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    const matchesCustomerType = customerTypeFilter === "all" || apt.customer_type === customerTypeFilter;

    return matchesSearch && matchesStatus && matchesCustomerType;
  });

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setEditForm({
      status: appointment.status || 'submitted',
      appointment_datetime: appointment.appointment_datetime ? new Date(appointment.appointment_datetime).toISOString().slice(0, 16) : '',
      notes: appointment.notes || ''
    });
    setShowEditDialog(true);
  };

  // Alias for handleEdit for mobile card's "View Details" button
  const handleViewDetails = (appointment) => {
    handleEdit(appointment);
  };

  const handleConfirm = async (appointmentId) => {
    setIsUpdating(true);
    try {
      await updateEntity(AppointmentRequest, appointmentId, { status: 'confirmed' }, 'AppointmentRequest');
      
      // Sync with Google Calendar
      try {
          await base44.functions.invoke('syncAppointmentToGoogleCalendar', { appointmentId: appointmentId });
      } catch(e) {
          console.error("Failed to sync with google calendar", e);
      }

      loadData(); // Reload data to reflect the change
    } catch (error) {
      console.error("Error confirming appointment:", error);
      alert("שגיאה באישור התור: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedAppointment) return;

    setIsUpdating(true);
    try {
      const updateData = {
        status: editForm.status,
        notes: editForm.notes
      };

      // רק אם יש תאריך ושעה חדשים
      if (editForm.appointment_datetime) {
        updateData.appointment_datetime = new Date(editForm.appointment_datetime).toISOString();
      }

      await updateEntity(AppointmentRequest, selectedAppointment.id, updateData, 'AppointmentRequest');

      // Sync with Google Calendar
      if (updateData.status === 'confirmed' || updateData.status === 'cancelled' || updateData.appointment_datetime) {
        try {
            await base44.functions.invoke('syncAppointmentToGoogleCalendar', { appointmentId: selectedAppointment.id });
        } catch(e) {
            console.error("Failed to sync with google calendar", e);
        }
      }

      setShowEditDialog(false);
      setSelectedAppointment(null);
      loadData();
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("שגיאה בעדכון התור: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStats = () => {
    return {
      total: appointments.length,
      submitted: appointments.filter(a => a.status === 'submitted').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      newCustomers: appointments.filter(a => a.customer_type === 'new').length
    };
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="ניהול תורים"
            description="שגיאה בטעינת הנתונים"
          />
          <ErrorMessage error={error} onRetry={loadData} />
        </div>
      </div>
    );
  }

  const stats = getStats();

  // Mobile Card Component
  const AppointmentMobileCard = ({ appointment, index }) => {
    const statusConf = statusConfig[appointment.status] || statusConfig.submitted;
    const StatusIcon = statusConf.icon;
    const isNewCustomer = appointment.customer_type === 'new';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`rounded-lg border-2 p-4 shadow-sm hover:shadow-md transition-shadow ${
          isNewCustomer ? 'bg-[#f2bbad]' : 'bg-white border-gray-100'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <Badge className={`${statusConf.color} border text-xs flex items-center gap-1`}>
            <StatusIcon className="w-3 h-3" />
            {statusConf.label}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {appointment.request_type === 'vaccination' ? 'חיסון' : 'ביקור רפואי'}
          </Badge>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium text-gray-800 text-sm">{appointment.owner_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="text-gray-700 text-sm">{appointment.pet_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <a href={`tel:${appointment.owner_phone}`} className="text-blue-600 text-sm hover:underline">
              {appointment.owner_phone}
            </a>
          </div>
          {appointment.appointment_datetime ? (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span className="text-gray-700 text-sm">
                {formatDateTimeInIsrael(appointment.appointment_datetime, 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
          ) : appointment.preferred_date ? (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>מועדף: {formatDateTimeInIsrael(appointment.preferred_date, 'dd/MM/yyyy')}</span>
              {appointment.preferred_time && <span> ({appointment.preferred_time})</span>}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>לא נקבע תאריך מועדף</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(appointment)}
            className="flex-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <Eye className="w-4 h-4 ml-1" />
            צפייה
          </Button>
          {appointment.status === 'submitted' && (
            <Button
              size="sm"
              onClick={() => handleConfirm(appointment.id)}
              disabled={isUpdating}
              className="flex-1 bg-green-500 text-white hover:bg-green-600"
            >
              {isUpdating ? <LoadingSpinner size="sm" className="ml-2" /> : null}
              <CheckCircle className="w-4 h-4 ml-1" />
              אשר
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header - Mobile */}
        <div className="mb-4 md:mb-6 block md:hidden">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            ניהול תורים
          </h1>
          <p className="text-sm text-slate-600">
            ניהול בקשות תורים והתראות
          </p>
        </div>

        {/* Header - Desktop (using PageHeader) */}
        <div className="hidden md:block">
          <PageHeader
            title="ניהול תורים"
            description={
              currentUser?.role === "admin"
                ? "ניהול כל בקשות התורים מכל המרפאות"
                : "ניהול בקשות התורים של המרפאה שלך"
            }
            actionLabel="בקשת תור חדשה"
            actionIcon={Plus}
            onAction={() => navigate(createPageUrl("AppointmentBooking"))}
          />
        </div>

        {/* סטטיסטיקות */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-slate-600">סה״כ תורים</p>
                  <p className="text-xl md:text-3xl font-bold text-blue-600">
                    {isLoading ? <LoadingSpinner size="sm" /> : stats.total}
                  </p>
                </div>
                <Calendar className="w-8 h-8 md:w-12 md:h-12 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-yellow-100 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-slate-600">ממתינים לאישור</p>
                  <p className="text-xl md:text-3xl font-bold text-yellow-600">
                    {isLoading ? <LoadingSpinner size="sm" /> : stats.submitted}
                  </p>
                </div>
                <Clock className="w-8 h-8 md:w-12 md:h-12 text-yellow-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-100 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-slate-600">מאושרים</p>
                  <p className="text-xl md:text-3xl font-bold text-green-600">
                    {isLoading ? <LoadingSpinner size="sm" /> : stats.confirmed}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 md:w-12 md:h-12 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-100 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-slate-600">הושלמו</p>
                  <p className="text-xl md:text-3xl font-bold text-slate-600">
                    {isLoading ? <LoadingSpinner size="sm" /> : stats.completed}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 md:w-12 md:h-12 text-slate-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* סינונים */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg mb-4 md:mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
              <Filter className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
              סינון וחיפוש
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="חיפוש לפי שם בעלים, חיית מחמד או טלפון..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 text-sm md:text-base"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                  size="sm"
                  className="text-xs md:text-sm"
                >
                  הכל
                </Button>
                <Button
                  variant={statusFilter === "submitted" ? "default" : "outline"}
                  onClick={() => setStatusFilter("submitted")}
                  size="sm"
                  className="text-xs md:text-sm"
                >
                  ממתינים
                </Button>
                <Button
                  variant={statusFilter === "confirmed" ? "default" : "outline"}
                  onClick={() => setStatusFilter("confirmed")}
                  size="sm"
                  className="text-xs md:text-sm"
                >
                  מאושרים
                </Button>
                <Button
                  variant={statusFilter === "completed" ? "default" : "outline"}
                  onClick={() => setStatusFilter("completed")}
                  size="sm"
                  className="text-xs md:text-sm"
                >
                  הושלמו
                </Button>
                <Button
                  variant={customerTypeFilter === "new" ? "default" : "outline"}
                  onClick={() => setCustomerTypeFilter(customerTypeFilter === "new" ? "all" : "new")}
                  size="sm"
                  className="text-xs md:text-sm bg-[#f2bbad] hover:bg-[#e8a899] border-[#d99688]"
                  style={customerTypeFilter === "new" ? { backgroundColor: '#f2bbad' } : {}}
                >
                  לקוחות חדשים ({stats.newCustomers})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* טבלת תורים / Mobile Cards */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="border-b border-blue-100">
            <CardTitle className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
              רשימת תורים ({filteredAppointments.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {!isLoading && filteredAppointments.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title={searchQuery || statusFilter !== "all"
                  ? "לא נמצאו תורים התואמים לקריטריונים שנבחרו"
                  : "אין בקשות תור להצגה"}
                description="נסו לשנות את מונחי החיפוש או הסינון"
              />
            ) : (
              <>
                {/* Mobile View */}
                <div className="md:hidden p-4 space-y-3">
                  <AnimatePresence>
                    {isLoading ? (
                      <LoadingSpinner />
                    ) : (
                      filteredAppointments.map((apt, index) => (
                        <AppointmentMobileCard key={apt.id} appointment={apt} index={index} />
                      ))
                    )}
                  </AnimatePresence>
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="text-right">בעלים</TableHead>
                        <TableHead className="text-right">חיית מחמד</TableHead>
                        <TableHead className="text-right">סוג בקשה</TableHead>
                        <TableHead className="text-right">תאריך ושעה</TableHead>
                        <TableHead className="text-right">סטטוס</TableHead>
                        <TableHead className="text-right">נוצר</TableHead>
                        <TableHead className="text-right">פעולות</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="wait">
                        {isLoading ? (
                          <TableSkeleton rows={5} columns={7} />
                        ) : (
                          filteredAppointments.map((apt, index) => {
                            const config = statusConfig[apt.status] || statusConfig.draft;
                            const StatusIcon = config.icon;
                            const isNewCustomer = apt.customer_type === 'new';

                            return (
                              <motion.tr
                                key={apt.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`transition-colors ${
                                  isNewCustomer ? 'bg-[#f2bbad] hover:bg-[#e8a899]' : 'hover:bg-blue-50/50'
                                }`}
                              >
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-slate-800">{apt.owner_name}</span>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                      <Phone className="w-3 h-3" />
                                      {apt.owner_phone}
                                    </div>
                                    {apt.owner_email && (
                                      <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Mail className="w-3 h-3" />
                                        {apt.owner_email}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>

                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <PawPrint className="w-4 h-4 text-orange-500" />
                                    <span className="font-medium text-slate-700">{apt.pet_name}</span>
                                  </div>
                                  {apt.pet_type && (
                                    <span className="text-xs text-slate-500">{apt.pet_type}</span>
                                  )}
                                </TableCell>

                                <TableCell>
                                  <Badge variant="outline" className="border-blue-200">
                                    {apt.request_type === 'vaccination' ? 'חיסון' : 'ביקור רפואי'}
                                  </Badge>
                                  {apt.customer_type === 'new' && (
                                    <Badge variant="outline" className="mr-2 border-purple-200">
                                      לקוח חדש
                                    </Badge>
                                  )}
                                </TableCell>

                                <TableCell>
                                  {apt.appointment_datetime ? (
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4 text-slate-400" />
                                      <span className="text-sm font-medium">
                                        {formatDateTimeInIsrael(apt.appointment_datetime, 'dd/MM/yyyy HH:mm')}
                                      </span>
                                    </div>
                                  ) : apt.preferred_date ? (
                                    <span className="text-sm text-slate-600">
                                      מועדף: {formatDateTimeInIsrael(apt.preferred_date, 'dd/MM/yyyy')}
                                      {apt.preferred_time && ` (${apt.preferred_time})`}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-slate-400">לא נקבע</span>
                                  )}
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
                                    {formatDateTimeInIsrael(apt.created_date, 'dd/MM HH:mm')}
                                  </span>
                                </TableCell>

                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(apt)}
                                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                    >
                                      <Edit className="w-4 h-4 ml-1" />
                                      ערוך
                                    </Button>
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
              </>
            )}
          </CardContent>
        </Card>

        {/* דיאלוג עריכה */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent dir="rtl" className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>עריכת תור - {selectedAppointment?.owner_name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>סטטוס</Label>
                <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">ממתין לאישור</SelectItem>
                    <SelectItem value="confirmed">מאושר</SelectItem>
                    <SelectItem value="completed">הושלם</SelectItem>
                    <SelectItem value="cancelled">בוטל</SelectItem>
                  </SelectContent>
                </Select>
                {editForm.status === 'confirmed' && (
                  <p className="text-xs text-blue-600">שינוי לסטטוס "מאושר" יפעיל תזכורות אוטומטיות</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>תאריך ושעת תור מדויקים</Label>
                <Input
                  type="datetime-local"
                  value={editForm.appointment_datetime}
                  onChange={(e) => setEditForm({ ...editForm, appointment_datetime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>הערות</Label>
                <Input
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="הערות נוספות..."
                />
              </div>

              {selectedAppointment?.customer_type === 'new' && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-800 font-medium">לקוח חדש</p>
                  <p className="text-xs text-purple-600 mt-1">
                    נשלח ללקוח קישור לטופס היכרות. וודאו שהטופס מולא לפני התור.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                ביטול
              </Button>
              <Button onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating ? <LoadingSpinner size="sm" className="ml-2" /> : null}
                שמור שינויים
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}