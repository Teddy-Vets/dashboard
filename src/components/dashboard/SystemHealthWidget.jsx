import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Calendar,
  TrendingUp,
  FileX,
  UserX
} from 'lucide-react';
import { formatTimeOnly } from '@/components/utils/dateUtils';

export default function SystemHealthWidget({ 
  pendingForms = [], 
  todayAppointmentsCount = 0,
  avgResponseHours = 0,
  completionRate = 0,
  isLoading = false 
}) {
  
  // Ensure pendingForms is always an array
  const pendingFormsArray = Array.isArray(pendingForms) ? pendingForms : [];
  
  // חישוב אלרטים דחופים
  const urgentAlerts = [];
  
  // טפסים שממתינים מעל 24 שעות
  const staleForms = pendingFormsArray.filter(form => {
    if (!form.created_date) return false;
    const createdAt = new Date(form.created_date);
    const hoursAgo = (new Date() - createdAt) / (1000 * 60 * 60);
    return hoursAgo > 24;
  });
  
  if (staleForms.length > 0) {
    urgentAlerts.push({
      type: 'critical',
      icon: FileX,
      title: `${staleForms.length} טפסים ממתינים מעל 24 שעות`,
      description: 'דורשים טיפול מיידי'
    });
  }
  
  // תורים להיום
  if (todayAppointmentsCount > 0) {
    urgentAlerts.push({
      type: 'info',
      icon: Calendar,
      title: `${todayAppointmentsCount} תורים מתוזמנים להיום`,
      description: 'וודא שהכל מוכן לקבלת לקוחות'
    });
  }
  
  // אזהרה כללית על טפסים ממתינים
  if (pendingFormsArray.length > 10) {
    urgentAlerts.push({
      type: 'warning',
      icon: AlertTriangle,
      title: `${pendingFormsArray.length} טפסים ממתינים לטיפול`,
      description: 'מומלץ לעבור על הטפסים הממתינים'
    });
  }

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            מצב המערכת
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          מצב המערכת
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* אלרטים דחופים */}
        {urgentAlerts.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-slate-600 uppercase tracking-wide">דורש תשומת לב</h4>
            {urgentAlerts.map((alert, index) => {
              const Icon = alert.icon;
              const colorClasses = {
                critical: 'border-red-200 bg-red-50 text-red-700',
                warning: 'border-amber-200 bg-amber-50 text-amber-700', 
                info: 'border-blue-200 bg-blue-50 text-blue-700'
              };
              
              return (
                <div key={index} className={`p-3 rounded-lg border ${colorClasses[alert.type]}`}>
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs opacity-75 mt-1">{alert.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle className="w-5 h-5" />
            <div>
              <p className="font-medium text-sm">הכל תקין</p>
              <p className="text-xs opacity-75">אין פעולות דחופות הדורשות טיפול</p>
            </div>
          </div>
        )}

        {/* מטריקות ביצועים */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-slate-600 uppercase tracking-wide">ביצועים</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-600">זמן תגובה ממוצע</span>
              </div>
              <p className="text-lg font-bold text-slate-800 mt-1">
                {avgResponseHours > 0 ? `${Math.round(avgResponseHours)}ש'` : 'N/A'}
              </p>
            </div>
            
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-600">אחוז השלמה</span>
              </div>
              <p className="text-lg font-bold text-slate-800 mt-1">
                {completionRate > 0 ? `${Math.round(completionRate)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* עדכון אחרון */}
        <div className="pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            עדכון אחרון: {formatTimeOnly(new Date().toISOString())}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}