import React, { useState, useEffect } from "react";
import { Client, Pet, IntakeForm } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  PawPrint,
  FileText,
  UserPlus,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

import userService from "@/components/services/userService";
import { getEntityList, ApiError } from "@/components/utils/apiHelpers";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { TableSkeleton } from "@/components/common/LoadingSkeleton";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [pets, setPets] = useState([]);
  const [forms, setForms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await userService.getCurrentUser();
      setCurrentUser(user);

      let clientsPromise, petsPromise, formsPromise;

      if (user.role === 'admin') {
        clientsPromise = getEntityList(Client, {}, "-created_date", null, 'Client');
        petsPromise = getEntityList(Pet, {}, "-created_date", null, 'Pet');
        formsPromise = getEntityList(IntakeForm, {}, "-created_date", null, 'IntakeForm');
      } else {
        if (!user.clinic_id) {
          throw new ApiError('משתמש לא משויך למרפאה', 400);
        }
        clientsPromise = getEntityList(Client, { clinic_id: user.clinic_id }, "-created_date", null, 'Client');
        petsPromise = getEntityList(Pet, { clinic_id: user.clinic_id }, "-created_date", null, 'Pet');
        formsPromise = getEntityList(IntakeForm, { clinic_id: user.clinic_id }, "-created_date", null, 'IntakeForm');
      }

      const [clientsData, petsData, formsData] = await Promise.all([
        clientsPromise,
        petsPromise,
        formsPromise
      ]);

      setClients(clientsData);
      setPets(petsData);
      setForms(formsData);
    } catch (error) {
      console.error("Error loading clients data:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getClientPets = (clientId) => {
    return pets.filter(pet => pet.client_id === clientId);
  };

  const getClientForms = (clientId) => {
    return forms.filter(form => form.client_id === clientId);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone?.includes(searchTerm);

    const matchesStatus = filterStatus === "all" || client.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="ניהול לקוחות"
            description="שגיאה בטעינת הנתונים"
          />
          <ErrorMessage error={error} onRetry={loadData} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="ניהול לקוחות"
          description={
            currentUser?.role === 'admin'
              ? 'רשימת כל הלקוחות מכל המרפאות'
              : 'רשימת לקוחות המרפאה שלך'
          }
          actionLabel="לקוח חדש"
          actionIcon={UserPlus}
          onAction={() => {
            // TODO: Implement add client functionality
            console.log('Add new client');
          }}
        />

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="חיפוש לפי שם, אימייל או טלפון..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  onClick={() => setFilterStatus("all")}
                  size="sm"
                >
                  הכל
                </Button>
                <Button
                  variant={filterStatus === "new" ? "default" : "outline"}
                  onClick={() => setFilterStatus("new")}
                  size="sm"
                >
                  לקוחות חדשים
                </Button>
                <Button
                  variant={filterStatus === "active" ? "default" : "outline"}
                  onClick={() => setFilterStatus("active")}
                  size="sm"
                >
                  לקוחות פעילים
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardHeader className="border-b border-blue-100">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              רשימת לקוחות ({filteredClients.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {!isLoading && filteredClients.length === 0 ? (
              <EmptyState
                icon={Users}
                title={searchTerm || filterStatus !== "all" 
                  ? "לא נמצאו לקוחות התואמים לקריטריונים שנבחרו"
                  : "אין לקוחות להצגה"}
                description="נסו לשנות את מונחי החיפוש או להוסיף לקוח חדש"
                actionLabel="הוסף לקוח חדש"
                onAction={() => {
                  // TODO: Implement add client functionality
                  console.log('Add new client');
                }}
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="text-right">שם הבעלים</TableHead>
                      <TableHead className="text-right">פרטי קשר</TableHead>
                      <TableHead className="text-right">חיות מחמד</TableHead>
                      <TableHead className="text-right">טפסים</TableHead>
                      <TableHead className="text-right">סטטוס</TableHead>
                      <TableHead className="text-right">תאריך הצטרפות</TableHead>
                      <TableHead className="text-right">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <TableSkeleton rows={5} columns={7} />
                      ) : (
                        filteredClients.map((client, index) => {
                          const clientPets = getClientPets(client.id);
                          const clientForms = getClientForms(client.id);

                          return (
                            <motion.tr
                              key={client.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-blue-50/50 transition-colors"
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold">
                                    {client.owner_name?.[0]?.toUpperCase() || "?"}
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-800">{client.owner_name}</p>
                                    <p className="text-sm text-slate-500">לקוח #{client.id?.slice(-6)}</p>
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span>{client.phone}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <span className="text-blue-600">{client.email}</span>
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <PawPrint className="w-4 h-4 text-orange-500" />
                                  <span className="font-medium">{clientPets.length}</span>
                                  {clientPets.length > 0 && (
                                    <span className="text-sm text-slate-500">
                                      ({clientPets.map(pet => pet.pet_name).join(", ")})
                                    </span>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-purple-500" />
                                  <span className="font-medium">{clientForms.length}</span>
                                  <span className="text-sm text-slate-500">טפסים</span>
                                </div>
                              </TableCell>

                              <TableCell>
                                <StatusBadge status={client.status || 'new'} />
                              </TableCell>

                              <TableCell>
                                <span className="text-sm text-slate-600">
                                  {client.created_date ?
                                    format(new Date(client.created_date), "d MMM yyyy", { locale: he }) :
                                    "לא זמין"
                                  }
                                </span>
                              </TableCell>

                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                >
                                  <Eye className="w-4 h-4 ml-1" />
                                  צפייה
                                </Button>
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