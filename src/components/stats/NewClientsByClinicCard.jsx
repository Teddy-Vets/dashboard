import React from 'react';
import { Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);
const formatNumber = (value) => new Intl.NumberFormat('he-IL').format(value || 0);

export default function NewClientsByClinicCard({ rows = [], periodLabel }) {
  const totals = rows.reduce(
    (acc, row) => ({
      newClients: acc.newClients + row.newClients,
      sent: acc.sent + row.sent,
      returned: acc.returned + row.returned,
      reviewed: acc.reviewed + row.reviewed,
    }),
    { newClients: 0, sent: 0, returned: 0, reviewed: 0 }
  );

  return (
    <Card className="border-slate-100 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
          <Building2 className="h-5 w-5 text-blue-500" />
          לקוחות חדשים — כל המרפאות
        </CardTitle>
        <p className="text-sm text-slate-500">{periodLabel}</p>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-right">מרפאה</TableHead>
                <TableHead className="text-center">לקוחות חדשים</TableHead>
                <TableHead className="text-center">נשלח טופס</TableHead>
                <TableHead className="text-center">החזירו</TableHead>
                <TableHead className="text-center">נבדקו</TableHead>
                <TableHead className="text-left">נבדקו מהחוזרים</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-slate-400">
                    אין נתונים להצגה בתקופה זו
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.clinicId} className="hover:bg-blue-50/40">
                    <TableCell className="text-right font-medium text-slate-800">{row.name}</TableCell>
                    <TableCell className="text-center font-semibold text-slate-700">{formatNumber(row.newClients)}</TableCell>
                    <TableCell className="text-center text-slate-600">{formatNumber(row.sent)}</TableCell>
                    <TableCell className="text-center text-slate-600">{formatNumber(row.returned)}</TableCell>
                    <TableCell className="text-center text-slate-600">{formatNumber(row.reviewed)}</TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center justify-end gap-2">
                        <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 sm:block">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${pct(row.reviewed, row.returned)}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-800">{pct(row.reviewed, row.returned)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="border-t bg-slate-50 font-semibold text-slate-800">
                  <td className="p-3 text-right">סה"כ</td>
                  <td className="p-3 text-center">{formatNumber(totals.newClients)}</td>
                  <td className="p-3 text-center">{formatNumber(totals.sent)}</td>
                  <td className="p-3 text-center">{formatNumber(totals.returned)}</td>
                  <td className="p-3 text-center">{formatNumber(totals.reviewed)}</td>
                  <td className="p-3 text-left">{pct(totals.reviewed, totals.returned)}%</td>
                </tr>
              </tfoot>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}