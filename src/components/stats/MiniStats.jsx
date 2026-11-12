import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const formatNumber = (value) => new Intl.NumberFormat('he-IL').format(value || 0);

export default function MiniStats({ items }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.key} className="border-slate-100 bg-white/80 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.iconBg}`}>
                <Icon className={`h-4 w-4 ${item.iconText}`} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs text-slate-500">{item.label}</p>
                <p className="text-lg font-bold text-slate-800">{formatNumber(item.value)}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}