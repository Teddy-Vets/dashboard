import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Link as LinkIcon } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function ShareIntakeFormDialog({ isOpen, onClose, clinics, currentUser }) {
  const [selectedClinicId, setSelectedClinicId] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (isOpen) {
      if (isAdmin) {
        // Reset on open for admin
        setSelectedClinicId('');
        setGeneratedLink('');
      } else {
        // Pre-fill for regular user
        const userClinicId = currentUser?.clinic_id;
        if (userClinicId) {
          setSelectedClinicId(userClinicId);
          const link = `${window.location.origin}${createPageUrl(`PublicForm?clinicId=${userClinicId}`)}`;
          setGeneratedLink(link);
        }
      }
    }
  }, [isOpen, isAdmin, currentUser, clinics]);
  
  const handleClinicSelect = (clinicId) => {
    setSelectedClinicId(clinicId);
    const link = `${window.location.origin}${createPageUrl(`PublicForm?clinicId=${clinicId}`)}`;
    setGeneratedLink(link);
  };
  
  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      alert('הקישור הועתק בהצלחה!');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-blue-500" />
            שיתוף קישור לטופס היכרות
          </DialogTitle>
          <DialogDescription>
            העתיקו את הקישור ושלחו ללקוח חדש למילוי טופס היכרות לפני ההגעה למרפאה.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {isAdmin && (
            <div>
              <Label htmlFor="clinic-select">בחירת מרפאה</Label>
              <Select onValueChange={handleClinicSelect} value={selectedClinicId}>
                <SelectTrigger id="clinic-select">
                  <SelectValue placeholder="בחרו מרפאה..." />
                </SelectTrigger>
                <SelectContent>
                  {clinics?.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {generatedLink && (
            <div>
              <Label htmlFor="link">קישור ציבורי</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input id="link" value={generatedLink} readOnly />
                <Button size="icon" onClick={handleCopyLink} disabled={!generatedLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>סגור</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}