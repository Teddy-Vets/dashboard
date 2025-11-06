import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function PageHeader({
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  backButton = false,
  onBack,
  className = ''
}) {
  return (
    <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 ${className}`}>
      <div className="flex items-center gap-4">
        {backButton && onBack && (
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{title}</h1>
          {description && <p className="text-slate-600">{description}</p>}
        </div>
      </div>

      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg"
        >
          {ActionIcon && <ActionIcon className="w-4 h-4 ml-2" />}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}