import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, CheckCircle, AlertCircle, FileText } from 'lucide-react';

const statusConfig = {
  // סטטוסים לטפסי היכרות
  submitted: {
    label: 'נשלח',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock
  },
  reviewed: {
    label: 'נבדק',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Eye
  },
  completed: {
    label: 'הושלם',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle
  },
  // סטטוסים לטפסי הסכמה
  pending: {
    label: 'ממתין לחתימה',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock
  },
  signed: {
    label: 'נחתם',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle
  },
  // סטטוסי לקוחות
  new: {
    label: 'חדש',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: FileText
  },
  active: {
    label: 'פעיל',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle
  },
  inactive: {
    label: 'לא פעיל',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: AlertCircle
  }
};

export default function StatusBadge({ status, showIcon = true, className = '' }) {
  const config = statusConfig[status] || statusConfig.submitted;
  const StatusIcon = config.icon;

  return (
    <Badge 
      variant="secondary" 
      className={`${config.color} border ${className} ${showIcon ? 'flex items-center gap-1' : ''}`}
    >
      {showIcon && <StatusIcon className="w-3 h-3" />}
      {config.label}
    </Badge>
  );
}