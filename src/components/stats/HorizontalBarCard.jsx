import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const valueLabel = (unit) => (value) => `${value}${unit ? ` ${unit}` : ''}`;

const BarTooltip = ({ active, payload, unit }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div dir="rtl" className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-lg">
      <p className="font-semibold text-slate-800">{entry.payload.fullName || entry.payload.name}</p>
      <p className="text-slate-600">{valueLabel(unit)(entry.value)}</p>
    </div>
  );
};

export default function HorizontalBarCard({
  title,
  subtitle,
  icon: Icon,
  iconClassName = 'text-blue-500',
  data,
  unit = '',
  yAxisWidth = 120,
  barColor = '#3b82f6',
  emptyText = 'אין נתונים להצגה בתקופה זו',
}) {
  const rows = (data || []).filter((row) => (row.value || 0) > 0);

  return (
    <Card className="border-slate-100 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
          {Icon && <Icon className={`h-5 w-5 ${iconClassName}`} />}
          {title}
        </CardTitle>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-16 text-center text-slate-400">{emptyText}</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(200, rows.length * 40)}>
            <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={yAxisWidth}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<BarTooltip unit={unit} />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                {rows.map((entry, index) => (
                  <Cell key={index} fill={entry.color || barColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}