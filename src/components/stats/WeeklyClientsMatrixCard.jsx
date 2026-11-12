import React, { useMemo } from 'react';
import { Building2, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { buildMatrixCsv } from '@/components/stats/weeklyMatrixCsv';

const formatNumber = (value) => new Intl.NumberFormat('he-IL').format(value || 0);

export default function WeeklyClientsMatrixCard({
  weeks = [],
  records = [],
  clinics = [],
  periodLabel,
  title = 'לקוחות חדשים לפי שבוע — כל המרפאות',
  description = 'טבלה אחת לכל המרפאות, שבוע בכל שורה. ניתן להוריד אותה ולשלוח למרפאות',
  fileName = 'לקוחות-חדשים-כל-המרפאות.csv',
  showTotals = true,
}) {
  const { clinicColumns, rows, clinicTotals, grandTotal } = useMemo(() => {
    const clinicColumns = clinics.map((clinic) => ({ id: clinic.id, name: clinic.name?.trim() || 'ללא שם' }));
    const valueMap = new Map();
    records.forEach((record) => {
      valueMap.set(`${record.clinic_id}|${record.week_start}`, record.new_clients || 0);
    });

    const rows = weeks.map((week) => {
      const values = clinicColumns.map((clinic) => valueMap.get(`${clinic.id}|${week.weekStart}`) || 0);
      return {
        weekStart: week.weekStart,
        label: week.label,
        values,
        total: values.reduce((sum, value) => sum + value, 0),
      };
    });

    return {
      clinicColumns,
      rows,
      clinicTotals: clinicColumns.map((clinic, index) => rows.reduce((sum, row) => sum + row.values[index], 0)),
      grandTotal: rows.reduce((sum, row) => sum + row.total, 0),
    };
  }, [weeks, records, clinics]);

  if (!clinicColumns.length) return null;

  const handleDownload = () => {
    const csv = buildMatrixCsv({ clinics: clinicColumns, rows, clinicTotals, grandTotal });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-slate-100 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
              <Building2 className="h-5 w-5 text-indigo-500" />
              {title}
            </CardTitle>
            <CardDescription className="mt-1">
              {description}
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-1" onClick={handleDownload} disabled={!rows.length}>
            <Download className="h-4 w-4" />
            הורדת טבלה
          </Button>
        </div>
        {periodLabel && <p className="mt-1 text-xs text-slate-500">{periodLabel}</p>}
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-20 bg-slate-50">
              <tr className="text-xs font-medium text-slate-500">
                <th className="sticky right-0 z-10 bg-slate-50 px-3 py-2 text-right">שבוע</th>
                {clinicColumns.map((clinic) => (
                  <th key={clinic.id} className="whitespace-nowrap px-3 py-2 text-center">
                    {clinic.name}
                  </th>
                ))}
                <th className="bg-indigo-50 px-3 py-2 text-center text-indigo-700">סה"כ</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={clinicColumns.length + 2} className="py-10 text-center text-slate-400">
                    אין נתונים להצגה בתקופה זו
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.weekStart} className="border-t border-slate-100 hover:bg-indigo-50/30">
                    <td className="sticky right-0 bg-white px-3 py-2 text-right font-medium text-slate-700">{row.label}</td>
                    {row.values.map((value, index) => (
                      <td
                        key={clinicColumns[index].id}
                        className={`px-3 py-2 text-center ${value ? 'text-slate-700' : 'text-slate-300'}`}
                      >
                        {formatNumber(value)}
                      </td>
                    ))}
                    <td className="bg-indigo-50/60 px-3 py-2 text-center font-semibold text-indigo-800">{formatNumber(row.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {showTotals && rows.length > 0 && (
              <tfoot className="sticky bottom-0 z-20">
                <tr className="border-t-2 border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800">
                  <td className="sticky right-0 bg-slate-50 px-3 py-2 text-right">סה"כ</td>
                  {clinicTotals.map((value, index) => (
                    <td key={clinicColumns[index].id} className="px-3 py-2 text-center">
                      {formatNumber(value)}
                    </td>
                  ))}
                  <td className="bg-indigo-100 px-3 py-2 text-center text-indigo-900">{formatNumber(grandTotal)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </CardContent>
    </Card>
  );
}