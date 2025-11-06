import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Eye, Send, Archive } from 'lucide-react';
import { formatDateTimeInIsrael } from '@/components/utils/dateUtils';

/**
 * קומפוננטה לניהול גרסאות (Draft/Published) של טפסים
 */
export default function VersionControl({ 
  status = 'draft',
  versionNumber = 1,
  publishedAt,
  publishedBy,
  onSaveDraft,
  onPublish,
  onArchive,
  isLoading = false,
  canPublish = true,
  showArchive = false
}) {
  
  const statusConfig = {
    draft: {
      label: 'טיוטה',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: AlertCircle,
      description: 'המסמך נמצא במצב עריכה ולא מוכן לשליחה'
    },
    published: {
      label: 'מפורסם',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      description: 'המסמך מאושר ומוכן לשליחה ללקוחות'
    },
    sent: {
      label: 'נשלח',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Send,
      description: 'המסמך נשלח ללקוח'
    },
    archived: {
      label: 'בארכיון',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: Archive,
      description: 'המסמך הועבר לארכיון'
    }
  };

  const config = statusConfig[status] || statusConfig.draft;
  const StatusIcon = config.icon;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      {/* סטטוס נוכחי */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-800">סטטוס המסמך</h3>
          <Badge variant="secondary" className={`${config.color} border flex items-center gap-2 px-3 py-1`}>
            <StatusIcon className="w-4 h-4" />
            {config.label}
          </Badge>
        </div>
        <p className="text-sm text-slate-600">{config.description}</p>
        
        {/* פרטי גרסה */}
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">מספר גרסה:</span>
            <span className="font-medium text-slate-800">v{versionNumber}</span>
          </div>
          {publishedAt && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">תאריך פרסום:</span>
                <span className="font-medium text-slate-800">
                  {formatDateTimeInIsrael(publishedAt)}
                </span>
              </div>
              {publishedBy && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">פורסם על ידי:</span>
                  <span className="font-medium text-slate-800">{publishedBy}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* כפתורי פעולה */}
      <div className="space-y-3">
        {status === 'draft' && (
          <>
            {onSaveDraft && (
              <Button
                onClick={onSaveDraft}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <Eye className="w-4 h-4 ml-2" />
                שמור כטיוטה
              </Button>
            )}
            {onPublish && canPublish && (
              <Button
                onClick={onPublish}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                <CheckCircle className="w-4 h-4 ml-2" />
                פרסם גרסה
              </Button>
            )}
          </>
        )}

        {status === 'published' && onArchive && showArchive && (
          <Button
            onClick={onArchive}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            <Archive className="w-4 h-4 ml-2" />
            העבר לארכיון
          </Button>
        )}
      </div>

      {/* הסברים נוספים */}
      {status === 'draft' && canPublish && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 <strong>טיפ:</strong> שמרו את המסמך כטיוטה כדי להמשיך לערוך מאוחר יותר. 
            לאחר שתסיימו, לחצו על "פרסם גרסה" כדי לאפשר שליחה ללקוחות.
          </p>
        </div>
      )}
    </div>
  );
}