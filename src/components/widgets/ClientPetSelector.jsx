import React, { useState, useEffect } from 'react';
import { Client, Pet } from '@/entities/all';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User, PawPrint, Plus } from 'lucide-react';
import { getEntityList } from '@/components/utils/apiHelpers';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ClientPetSelector({ onSelection, defaultValues = {} }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientPets, setClientPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [isLoadingPets, setIsLoadingPets] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);

  // חיפוש לקוחות
  const searchClients = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const clients = await getEntityList(Client, {}, '-created_date', 50, 'Client');
      const filtered = clients.filter(client => 
        client.owner_name?.toLowerCase().includes(query.toLowerCase()) ||
        client.email?.toLowerCase().includes(query.toLowerCase()) ||
        client.phone?.includes(query)
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching clients:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // טעינת חיות מחמד של הלקוח שנבחר
  const loadClientPets = async (clientId) => {
    if (!clientId) return;

    setIsLoadingPets(true);
    try {
      const pets = await getEntityList(Pet, { client_id: clientId }, '-created_date', null, 'Pet');
      setClientPets(pets);
    } catch (error) {
      console.error('Error loading pets:', error);
      setClientPets([]);
    } finally {
      setIsLoadingPets(false);
    }
  };

  // טיפול בבחירת לקוח
  const handleClientSelect = async (client) => {
    setSelectedClient(client);
    setSelectedPet(null);
    setSearchResults([]);
    setSearchQuery(client.owner_name);
    await loadClientPets(client.id);
  };

  // טיפול בבחירת חיית מחמד
  const handlePetSelect = (pet) => {
    setSelectedPet(pet);
    // העברת הנתונים להורה
    onSelection({
      client: selectedClient,
      pet: pet,
      formData: {
        client_id: selectedClient.id,
        pet_id: pet.id,
        owner_name: selectedClient.owner_name,
        owner_email: selectedClient.email,
        owner_id: '', // יש למלא אם יש בנתונים
        pet_name: pet.pet_name
      }
    });
  };

  // טיפול בשינוי חיפוש
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchClients(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (showCreateNew) {
    return (
      <Card className="bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            יצירת לקוח חדש
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">מלא את הפרטים ידנית ללקוח חדש</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowCreateNew(false);
              onSelection({ client: null, pet: null, formData: {} });
            }}
          >
            מלא פרטים ידנית
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-green-50/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Search className="w-5 h-5 text-green-500" />
            חיפוש לקוח קיים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* שדה חיפוש */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="חפש לפי שם, אימייל או טלפון..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* תוצאות חיפוש */}
          {isSearching && (
            <div className="flex items-center justify-center p-4">
              <LoadingSpinner size="sm" />
              <span className="mr-2 text-slate-600">מחפש...</span>
            </div>
          )}

          {searchResults.length > 0 && !selectedClient && (
            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-md">
              {searchResults.map((client) => (
                <div
                  key={client.id}
                  className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                  onClick={() => handleClientSelect(client)}
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="font-medium text-slate-800">{client.owner_name}</p>
                      <p className="text-sm text-slate-500">{client.email} • {client.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* לקוח שנבחר */}
          {selectedClient && (
            <Card className="bg-white border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-slate-800">{selectedClient.owner_name}</p>
                      <p className="text-sm text-slate-500">{selectedClient.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedClient(null);
                      setSelectedPet(null);
                      setClientPets([]);
                      setSearchQuery('');
                    }}
                  >
                    שנה
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* בחירת חיית מחמד */}
          {selectedClient && (
            <div>
              <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                <PawPrint className="w-4 h-4 text-orange-500" />
                בחר חיית מחמד
              </h4>
              
              {isLoadingPets ? (
                <div className="flex items-center justify-center p-4">
                  <LoadingSpinner size="sm" />
                  <span className="mr-2 text-slate-600">טוען חיות מחמד...</span>
                </div>
              ) : clientPets.length > 0 ? (
                <Select onValueChange={(petId) => {
                  const pet = clientPets.find(p => p.id === petId);
                  if (pet) handlePetSelect(pet);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר חיית מחמד" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientPets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{pet.pet_name}</span>
                          <span className="text-sm text-slate-500">({pet.pet_type})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-slate-500 text-sm p-3 bg-slate-50 rounded-md">
                  לא נמצאו חיות מחמד עבור הלקוח הזה
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* אפשרות ליצירת לקוח חדש */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => setShowCreateNew(true)}
          className="text-slate-600 hover:text-slate-800"
        >
          <Plus className="w-4 h-4 ml-2" />
          צור טופס ללקוח חדש
        </Button>
      </div>
    </div>
  );
}