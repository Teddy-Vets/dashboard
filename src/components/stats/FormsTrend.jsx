import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { FORM_TYPES } from '@/components/stats/statsConfig';

const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);

  return (
    <div dir="rtl" className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-lg">
      <p className="mb-2 font-semibold text-slate-800">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-6 py-0.5">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}
          </span>
          <span className="font-medium text-slate-800">{entry.value || 0}</span>
        </div>
      ))}
      <div className="mt-2 flex items-center justify-between gap-6 border-t border-slate-100 pt-2 font-semibold text-slate-800">
        <span>סה"כ</span>
        <span>{total}</span>
      </div>
    </div>
  );
};

export default function FormsTrend({ buckets }) {
  const hasData = (buckets || []).some((bucket) =>
    FORM_TYPES.some((type) => (bucket[type.key] || 0) > 0)
  );

  return (
    <Card className="border-slate-100 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          מגמת טפסים לאורך התקופה
        </CardTitle>
        <p className="text-sm text-slate-500">מספר הטפסים שנפתחו בכל סוג, לפי תקופה</p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="py-16 text-center text-slate-400">אין נתונים להצגה בתקופה זו</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={buckets} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip content={<TrendTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Legend wrapperStyle={{ direction: 'rtl', fontSize: 13, paddingTop: 8 }} iconType="circle" iconSize={8} />
              {FORM_TYPES.map((type) => (
                <Bar key={type.key} dataKey={type.key} name={type.label} stackId="forms" fill={type.color} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}