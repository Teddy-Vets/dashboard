import React, { useState, useEffect } from "react";
import { Pet, Client } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  PawPrint, 
  Search, 
  Plus, 
  User as UserIcon,
  Calendar,
  Heart
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

import userService from "@/components/services/userService";
import { getEntityList, ApiError } from "@/components/utils/apiHelpers";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { CardSkeleton } from "@/components/common/LoadingSkeleton";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

export default function PetsPage() {
  const [pets, setPets] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
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

      let petsPromise, clientsPromise;

      if (user.role === 'admin') {
        petsPromise = getEntityList(Pet, {}, "-created_date", null, 'Pet');
        clientsPromise = getEntityList(Client, {}, "-created_date", null, 'Client');
      } else {
        if (!user.clinic_id) {
          throw new ApiError('משתמש לא משויך למרפאה', 400);
        }
        petsPromise = getEntityList(Pet, { clinic_id: user.clinic_id }, "-created_date", null, 'Pet');
        clientsPromise = getEntityList(Client, { clinic_id: user.clinic_id }, "-created_date", null, 'Client');
      }

      const [petsData, clientsData] = await Promise.all([
        petsPromise,
        clientsPromise
      ]);
      
      setPets(petsData);
      setClients(clientsData);
    } catch (error) {
      console.error("Error loading pets data:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.owner_name || "לא זמין";
  };

  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.pet_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getClientName(pet.client_id)?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || pet.pet_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const petTypeColors = {
    "כלב": "bg-blue-100 text-blue-800 border-blue-200",
    "חתול": "bg-purple-100 text-purple-800 border-purple-200",
    "ארנב": "bg-pink-100 text-pink-800 border-pink-200",
    "עוף": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "אחר": "bg-gray-100 text-gray-800 border-gray-200"
  };

  const genderIcons = {
    "זכר": "♂",
    "נקבה": "♀"
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="חיות המחמד"
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
          title="חיות המחמד"
          description={
            currentUser?.role === 'admin' 
              ? 'רשימת כל חיות המחמד מכל המרפאות' 
              : `רשימת חיות המחמד במרפאה שלך`
          }
          actionLabel="הוספת חיית מחמד"
          actionIcon={Plus}
          onAction={() => {
            // TODO: Implement add pet functionality
            console.log('Add new pet');
          }}
        />

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="חיפוש לפי שם החיה, גזע או שם הבעלים..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  onClick={() => setFilterType("all")}
                  size="sm"
                >
                  הכל
                </Button>
                <Button
                  variant={filterType === "כלב" ? "default" : "outline"}
                  onClick={() => setFilterType("כלב")}
                  size="sm"
                >
                  כלבים
                </Button>
                <Button
                  variant={filterType === "חתול" ? "default" : "outline"}
                  onClick={() => setFilterType("חתול")}
                  size="sm"
                >
                  חתולים
                </Button>
                <Button
                  variant={filterType === "אחר" ? "default" : "outline"}
                  onClick={() => setFilterType("אחר")}
                  size="sm"
                >
                  אחר
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pets Grid */}
        {!isLoading && filteredPets.length === 0 ? (
          <EmptyState
            icon={PawPrint}
            title={searchTerm || filterType !== "all" 
              ? "לא נמצאו חיות מחמד התואמות לקריטריונים שנבחרו"
              : "אין חיות מחמד להצגה"}
            description="נסו לשנות את מונחי החיפוש או להוסיף חיית מחמד חדשה"
            actionLabel="הוסף חיית מחמד ראשונה"
            onAction={() => {
              // TODO: Implement add pet functionality
              console.log('Add first pet');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {isLoading ? (
                <CardSkeleton count={6} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
              ) : (
                filteredPets.map((pet, index) => (
                  <motion.div
                    key={pet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
                      <CardContent className="p-6 text-center">
                        {/* Pet Avatar */}
                        <div className="relative mb-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {pet.pet_name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm text-sm">
                            {genderIcons[pet.gender] || "?"}
                          </div>
                        </div>

                        {/* Pet Info */}
                        <div className="space-y-3">
                          <div>
                            <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {pet.pet_name}
                            </h3>
                            <p className="text-sm text-slate-500">{pet.breed || "גזע לא צוין"}</p>
                          </div>

                          <Badge 
                            variant="secondary" 
                            className={`${petTypeColors[pet.pet_type] || petTypeColors["אחר"]} border`}
                          >
                            {pet.pet_type}
                          </Badge>

                          <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex items-center justify-center gap-2">
                              <UserIcon className="w-4 h-4 text-slate-400" />
                              <span>{getClientName(pet.client_id)}</span>
                            </div>
                            
                            {(pet.age_estimate || pet.birth_date) && (
                              <div className="flex items-center justify-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span>
                                  {pet.birth_date 
                                    ? format(new Date(pet.birth_date), "MMM yyyy", { locale: he })
                                    : pet.age_estimate
                                  }
                                </span>
                              </div>
                            )}

                            {pet.neutered && (
                              <div className="flex items-center justify-center gap-2">
                                <Heart className={`w-4 h-4 ${pet.neutered === 'כן' ? 'text-green-500' : 'text-orange-500'}`} />
                                <span className={pet.neutered === 'כן' ? 'text-green-600' : 'text-orange-600'}>
                                  {pet.neutered === 'כן' ? 'מסורס/מעוקרת' : 'לא מסורס/מעוקרת'}
                                </span>
                              </div>
                            )}

                            {pet.created_date && (
                              <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                                נוסף ב-{format(new Date(pet.created_date), "d MMM yyyy", { locale: he })}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}