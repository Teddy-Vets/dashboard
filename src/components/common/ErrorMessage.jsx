import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function ErrorMessage({ 
  error, 
  onRetry = null, 
  showRetry = true,
  className = '' 
}) {
  const getErrorMessage = (error) => {
    if (error?.message) return error.message;
    if (typeof error === 'string') return error;
    return 'אירעה שגיאה בלתי צפויה';
  };

  return (
    <Alert className={`border-red-200 bg-red-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <div className="flex justify-between items-start gap-4">
          <span>{getErrorMessage(error)}</span>
          {showRetry && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="w-3 h-3 ml-1" />
              נסה שוב
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}