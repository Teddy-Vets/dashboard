import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

const TONES = {
  blue: { iconBg: 'bg-blue-100', iconText: 'text-blue-600', border: 'border-blue-100' },
  purple: { iconBg: 'bg-purple-100', iconText: 'text-purple-600', border: 'border-purple-100' },
  green: { iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', border: 'border-emerald-100' },
  amber: { iconBg: 'bg-amber-100', iconText: 'text-amber-600', border: 'border-amber-100' },
};

const formatNumber = (value) => new Intl.NumberFormat('he-IL').format(value || 0);

function Delta({ value, previous }) {
  if (!previous && !value) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
        <Minus className="h-3 w-3" />
        אין נתונים
      </span>
    );
  }

  if (!previous) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        <ArrowUpRight className="h-3 w-3" />
        חדש בתקופה
      </span>
    );
  }

  const diff = value - previous;
  const isUp = diff > 0;
  const isFlat = diff === 0;
  const label = previous < 5
    ? `${diff > 0 ? '+' : ''}${formatNumber(diff)} מול תקופה קודמת`
    : `${Math.abs(Math.round((diff / previous) * 100))}% מול תקופה קודמת`;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        isFlat
          ? 'bg-slate-100 text-slate-600'
          : isUp
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-rose-50 text-rose-700'
      }`}
    >
      {isFlat ? <Minus className="h-3 w-3" /> : isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {label}
    </span>
  );
}

export default function StatCards({ items }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const tone = TONES[item.color] || TONES.blue;
        const Icon = item.icon;
        return (
          <Card key={item.key} className={`border ${tone.border} bg-white shadow-sm transition-shadow hover:shadow-md`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{formatNumber(item.value)}</p>
                </div>
                {Icon && (
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone.iconBg}`}>
                    <Icon className={`h-5 w-5 ${tone.iconText}`} />
                  </span>
                )}
              </div>
              <div className="mt-3">
                <Delta value={item.value} previous={item.previous} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}