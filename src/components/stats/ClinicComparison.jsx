import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2 } from 'lucide-react';

const formatNumber = (value) => new Intl.NumberFormat('he-IL').format(value || 0);

const COLUMNS = [
  { key: 'intake', label: 'טפסי היכרות' },
  { key: 'consent', label: 'טפסי הסכמה' },
  { key: 'appointment', label: 'בקשות תור' },
  { key: 'subscription', label: 'הסכמי מנוי' },
];

export default function ClinicComparison({ rows, periodLabel }) {
  const maxTotal = Math.max(...(rows || []).map((row) => row.total), 1);
  const totals = COLUMNS.reduce((acc, column) => {
    acc[column.key] = (rows || []).reduce((sum, row) => sum + row[column.key], 0);
    return acc;
  }, {});
  const grandTotal = Object.values(totals).reduce((sum, value) => sum + value, 0);

  return (
    <Card className="border-slate-100 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
          <Building2 className="h-5 w-5 text-blue-500" />
          השוואה בין מרפאות
        </CardTitle>
        <p className="text-sm text-slate-500">{periodLabel}</p>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-right">מרפאה</TableHead>
                {COLUMNS.map((column) => (
                  <TableHead key={column.key} className="text-center">
                    {column.label}
                  </TableHead>
                ))}
                <TableHead className="text-left">סה"כ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length + 2} className="py-10 text-center text-slate-400">
                    אין נתונים להצגה בתקופה זו
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.clinicId} className="hover:bg-blue-50/40">
                    <TableCell className="text-right font-medium text-slate-800">{row.name}</TableCell>
                    {COLUMNS.map((column) => (
                      <TableCell key={column.key} className="text-center text-slate-600">
                        {formatNumber(row[column.key])}
                      </TableCell>
                    ))}
                    <TableCell className="text-left">
                      <div className="flex items-center justify-end gap-2">
                        <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 sm:block">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${Math.round((row.total / maxTotal) * 100)}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-800">{formatNumber(row.total)}</span>
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
                  {COLUMNS.map((column) => (
                    <td key={column.key} className="p-3 text-center">
                      {formatNumber(totals[column.key])}
                    </td>
                  ))}
                  <td className="p-3 text-left">{formatNumber(grandTotal)}</td>
                </tr>
              </tfoot>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}