import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Phone, PawPrint } from 'lucide-react';
import { formatDateTimeInIsrael, isToday, isTomorrow } from '@/components/utils/dateUtils';

export default function UpcomingAppointments({ 
  appointments = [], 
  isLoading = false 
}) {
  
  // מיון לפי תאריך ושעה
  const sortedAppointments = appointments
    .filter(apt => apt.appointment_datetime)
    .sort((a, b) => new Date(a.appointment_datetime) - new Date(b.appointment_datetime))
    .slice(0, 5); // מציג עד 5 תורים הבאים

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-500" />
            תורים קרובים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-slate-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sortedAppointments.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Calendar className="w-5 h-5 text-green-500" />
            תורים קרובים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">אין תורים מתוזמנים</p>
            <p className="text-sm text-slate-400 mt-1">התורים הבאים יופיעו כאן</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <Calendar className="w-5 h-5 text-green-500" />
          תורים קרובים ({sortedAppointments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedAppointments.map((appointment, index) => {
          const appointmentDate = appointment.appointment_datetime;
          const isTodayAppointment = isToday(appointmentDate);
          const isTomorrowAppointment = isTomorrow(appointmentDate);
          
          const statusColors = {
            confirmed: 'bg-green-100 text-green-800',
            submitted: 'bg-yellow-100 text-yellow-800', 
            draft: 'bg-gray-100 text-gray-800'
          };

          return (
            <div key={appointment.id || index} className={`p-3 border rounded-lg transition-all hover:shadow-md ${isTodayAppointment ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <PawPrint className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-800">{appointment.owner_name}</span>
                    {isTodayAppointment && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">היום</Badge>
                    )}
                    {isTomorrowAppointment && (
                      <Badge className="bg-orange-100 text-orange-800 text-xs">מחר</Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-slate-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{formatDateTimeInIsrael(appointmentDate, 'dd/MM/yyyy HH:mm')}</span>
                    </div>
                    
                    {appointment.pet_name && (
                      <div className="flex items-center gap-2">
                        <PawPrint className="w-3 h-3" />
                        <span>{appointment.pet_name}</span>
                      </div>
                    )}
                    
                    {appointment.owner_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        <span>{appointment.owner_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <Badge className={statusColors[appointment.status] || statusColors.draft}>
                    {appointment.status === 'confirmed' ? 'מאושר' : 
                     appointment.status === 'submitted' ? 'ממתין' : 'טיוטה'}
                  </Badge>
                  
                  {appointment.request_type && (
                    <span className="text-xs text-slate-500">
                      {appointment.request_type === 'vaccination' ? 'חיסון' : 'ביקור רפואי'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}