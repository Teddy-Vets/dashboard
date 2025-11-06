import React from 'react';
import { Button } from '@/components/ui/button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && <Icon className="w-16 h-16 text-slate-300 mx-auto mb-4" />}
      <h3 className="text-xl font-semibold text-slate-600 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-500 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-blue-600 hover:bg-blue-700">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}