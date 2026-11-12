import React from 'react';
import { Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

export default function FormFunnelCard({ rows = [] }) {
  const totals = rows.reduce(
    (acc, row) => ({
      sent: acc.sent + row.sent,
      returned: acc.returned + row.returned,
      reviewed: acc.reviewed + row.reviewed,
    }),
    { sent: 0, returned: 0, reviewed: 0 }
  );

  return (
    <Card className="border-slate-100 bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-slate-800">
          <Filter className="h-4 w-4 text-blue-500" />
          נשלחו, הוחזרו ונבדקו
        </CardTitle>
        <CardDescription>מסלול הטיפול בכל סוג טופס בתקופה הנבחרת</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-xs font-medium text-slate-500">
                <th className="py-2 pe-2 text-right">סוג טופס</th>
                <th className="py-2 text-center">נשלחו</th>
                <th className="py-2 text-center">הוחזרו</th>
                <th className="py-2 text-center">נבדקו</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-t border-slate-100 align-middle">
                  <td className="py-3 pe-2">
                    <span className="flex items-center gap-2 font-medium text-slate-700">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
                      {row.label}
                    </span>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct(row.reviewed, row.sent)}%`, backgroundColor: row.color }}
                      />
                    </div>
                  </td>
                  <td className="py-3 text-center text-lg font-semibold text-slate-800">{row.sent}</td>
                  <td className="py-3 text-center">
                    <span className="text-lg font-semibold text-slate-800">{row.returned}</span>
                    <span className="ms-1 text-xs text-slate-400">{pct(row.returned, row.sent)}%</span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="text-lg font-semibold text-slate-800">{row.reviewed}</span>
                    <span className="ms-1 text-xs text-slate-400">{pct(row.reviewed, row.sent)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 text-xs text-slate-500">
                <td className="py-2 pe-2 text-right font-medium">סה"כ</td>
                <td className="py-2 text-center font-semibold text-slate-700">{totals.sent}</td>
                <td className="py-2 text-center font-semibold text-slate-700">{totals.returned}</td>
                <td className="py-2 text-center font-semibold text-slate-700">{totals.reviewed}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}