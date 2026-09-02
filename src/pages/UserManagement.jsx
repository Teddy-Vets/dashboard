import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Edit, Mail, Building2, Shield, Search, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import PageHeader from "@/components/common/PageHeader";
import { toast } from "sonner";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteClinicIds, setInviteClinicIds] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [usersData, clinicsData] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Clinic.list()
      ]);

      setUsers(usersData || []);
      setClinics(clinicsData || []);
    } catch (err) {
      console.error("Error loading users:", err);
      setError(err);
      toast.error("שגיאה בטעינת המשתמשים");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role || 'user',
      clinic_id: user.clinic_id || '',
      clinic_ids: user.clinic_ids || (user.clinic_id ? [user.clinic_id] : [])
    });
    setIsDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    setIsSaving(true);
    try {
      await base44.entities.User.update(editingUser.id, {
        role: editingUser.role,
        clinic_ids: editingUser.clinic_ids || [],
        clinic_id: editingUser.clinic_ids?.[0] || null
      });

      toast.success("המשתמש עודכן בהצלחה");
      setIsDialogOpen(false);
      setEditingUser(null);
      await loadData();
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("שגיאה בעדכון המשתמש");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);

      // Assign clinics after invite
      if (inviteClinicIds.length > 0) {
        try {
          const updatedUsers = await base44.entities.User.list();
          const newUser = updatedUsers.find(u => u.email === inviteEmail);
          if (newUser) {
            await base44.entities.User.update(newUser.id, {
              clinic_ids: inviteClinicIds,
              clinic_id: inviteClinicIds[0]
            });
          }
        } catch (e) {
          console.error("Could not assign clinics immediately:", e);
        }
      }

      toast.success(`הזמנה נשלחה ל-${inviteEmail}`);
      setIsInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("user");
      setInviteClinicIds([]);
      await loadData();
    } catch (err) {
      console.error("Error inviting user:", err);
      toast.error("שגיאה בשליחת ההזמנה");
    } finally {
      setIsInviting(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClinicName = (clinicId) => {
    const clinic = clinics.find(c => c.id === clinicId);
    return clinic ? clinic.name : '-';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="ניהול משתמשים"
            description="טוען נתונים..."
          />
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="ניהול משתמשים"
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
        <div className="flex items-center justify-between mb-6">
          <PageHeader
            title="ניהול משתמשים"
            description="ניהול משתמשי המערכת והרשאות"
            icon={Users}
          />
          <Button
            onClick={() => setIsInviteDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <UserPlus className="w-4 h-4" />
            הזמן משתמש
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="חיפוש לפי שם או אימייל..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              משתמשים ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-right p-3 text-sm font-medium text-slate-600">שם מלא</th>
                    <th className="text-right p-3 text-sm font-medium text-slate-600">אימייל</th>
                    <th className="text-right p-3 text-sm font-medium text-slate-600">תפקיד</th>
                    <th className="text-right p-3 text-sm font-medium text-slate-600">מרפאה</th>
                    <th className="text-right p-3 text-sm font-medium text-slate-600">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-slate-500 py-8">
                        לא נמצאו משתמשים
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
                        <td className="p-3 font-medium text-slate-800">{user.full_name}</td>
                        <td className="p-3 text-slate-600 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {user.email}
                        </td>
                        <td className="p-3">
                          <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                            <Shield className="w-3 h-3 ml-1" />
                            {user.role === 'admin' ? 'מנהל' : 'משתמש'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {(user.clinic_ids && user.clinic_ids.length > 0) ? (
                            <div className="flex flex-wrap gap-1">
                              {user.clinic_ids.map(cid => (
                                <Badge key={cid} variant="outline" className="text-xs gap-1">
                                  <Building2 className="w-3 h-3 text-blue-500" />
                                  {getClinicName(cid)}
                                </Badge>
                              ))}
                            </div>
                          ) : user.clinic_id ? (
                            <div className="flex items-center gap-2 text-slate-700">
                              <Building2 className="w-4 h-4 text-blue-500" />
                              {getClinicName(user.clinic_id)}
                            </div>
                          ) : (
                            <span className="text-red-500 text-sm font-medium">לא משויך למרפאה</span>
                          )}
                        </td>
                        <td className="p-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4 ml-1" />
                            עריכה
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Invite User Dialog */}
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הזמנת משתמש חדש</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>כתובת אימייל</Label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>תפקיד</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">משתמש רגיל</SelectItem>
                    <SelectItem value="admin">מנהל מערכת</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>מרפאות משויכות</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {clinics.map((clinic) => (
                    <div key={clinic.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`invite-clinic-${clinic.id}`}
                        checked={inviteClinicIds.includes(clinic.id)}
                        onCheckedChange={(checked) => {
                          setInviteClinicIds(prev =>
                            checked ? [...prev, clinic.id] : prev.filter(id => id !== clinic.id)
                          );
                        }}
                      />
                      <Label htmlFor={`invite-clinic-${clinic.id}`} className="cursor-pointer font-normal">
                        {clinic.name}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  ניתן לבחור מספר מרפאות. המשתמש יקבל גישה לכל המרפאות הנבחרות.
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)} disabled={isInviting}>
                  ביטול
                </Button>
                <Button onClick={handleInviteUser} disabled={isInviting || !inviteEmail} className="bg-blue-600 hover:bg-blue-700">
                  {isInviting ? (
                    <><LoadingSpinner size="sm" className="ml-2" />שולח...</>
                  ) : (
                    'שלח הזמנה'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>עריכת משתמש</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4">
                <div>
                  <Label>שם מלא</Label>
                  <Input value={editingUser.full_name} disabled className="bg-gray-50" />
                </div>

                <div>
                  <Label>אימייל</Label>
                  <Input value={editingUser.email} disabled className="bg-gray-50" />
                </div>

                <div>
                  <Label>תפקיד</Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">משתמש רגיל</SelectItem>
                      <SelectItem value="admin">מנהל מערכת</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>מרפאות משויכות</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {clinics.map((clinic) => (
                      <div key={clinic.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`edit-clinic-${clinic.id}`}
                          checked={(editingUser.clinic_ids || []).includes(clinic.id)}
                          onCheckedChange={(checked) => {
                            setEditingUser(prev => {
                              const currentIds = prev.clinic_ids || [];
                              const newIds = checked
                                ? [...currentIds, clinic.id]
                                : currentIds.filter(id => id !== clinic.id);
                              return { ...prev, clinic_ids: newIds, clinic_id: newIds[0] || null };
                            });
                          }}
                        />
                        <Label htmlFor={`edit-clinic-${clinic.id}`} className="cursor-pointer font-normal">
                          {clinic.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    ניתן לבחור מספר מרפאות. המשתמש יקבל גישה לכל המרפאות הנבחרות.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSaving}
                  >
                    ביטול
                  </Button>
                  <Button
                    onClick={handleSaveUser}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSaving ? (
                      <>
                        <LoadingSpinner size="sm" className="ml-2" />
                        שומר...
                      </>
                    ) : (
                      'שמור שינויים'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}