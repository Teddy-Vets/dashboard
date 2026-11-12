import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { PawPrint } from 'lucide-react';
import { PIE_COLORS, normalizePetType } from '@/components/stats/statsConfig';

const formatNumber = (value) => new Intl.NumberFormat('he-IL').format(value || 0);

const PetTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div dir="rtl" className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-lg">
      <p className="font-semibold text-slate-800">{entry.name}</p>
      <p className="text-slate-600">{formatNumber(entry.value)} טפסים</p>
    </div>
  );
};

export default function PetTypeChart({ rows }) {
  const { data, total } = useMemo(() => {
    const merged = new Map();
    (rows || []).forEach((row) => {
      const name = normalizePetType(row.pet_type);
      merged.set(name, (merged.get(name) || 0) + (row.count || 0));
    });
    const chartData = Array.from(merged.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    return {
      data: chartData,
      total: chartData.reduce((sum, item) => sum + item.value, 0),
    };
  }, [rows]);

  return (
    <Card className="border-slate-100 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
          <PawPrint className="h-5 w-5 text-emerald-500" />
          התפלגות סוגי חיות מחמד
        </CardTitle>
        <p className="text-sm text-slate-500">לפי טפסי היכרות בתקופה הנבחרת</p>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-16 text-center text-slate-400">אין נתונים להצגה בתקופה זו</p>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="relative h-[220px] w-full max-w-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={90}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {data.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PetTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800">{formatNumber(total)}</span>
                <span className="text-xs text-slate-500">סה"כ טפסים</span>
              </div>
            </div>
            <ul className="w-full space-y-2 sm:w-auto sm:min-w-[160px]">
              {data.map((entry, index) => (
                <li key={entry.name} className="flex items-center justify-between gap-4 text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    {entry.name}
                  </span>
                  <span className="font-medium text-slate-800">
                    {formatNumber(entry.value)}
                    <span className="mr-1 text-xs font-normal text-slate-400">
                      ({Math.round((entry.value / total) * 100)}%)
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}