import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// שלד טעינה לטבלה
export function TableSkeleton({ rows = 5, columns = 6 }) {
  return (
    <>
      {Array(rows).fill(0).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array(columns).fill(0).map((_, colIndex) => (
            <td key={colIndex} className="p-4">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// שלד טעינה לכרטיסים
export function CardSkeleton({ count = 3, className = '' }) {
  return (
    <div className={`grid gap-6 ${className}`}>
      {Array(count).fill(0).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// שלד טעינה לסטטיסטיקות
export function StatsSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array(count).fill(0).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="w-12 h-12 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}