import React from 'react';
import { Building2, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const formatNumber = (value) => new Intl.NumberFormat('he-IL').format(value || 0);

const COLUMNS = [
  { key: 'newClients', label: 'לקוחות חדשים' },
  { key: 'sent', label: 'טפסי היכרות שנשלחו' },
  { key: 'returned', label: 'הוחזרו ע"י הלקוח' },
  { key: 'reviewed', label: 'נבדקו במרפאה' },
];

function buildCsv(rows, totals) {
  const cell = (value) => {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [['מרפאה', ...COLUMNS.map((column) => column.label)].join(',')];
  rows.forEach((row) => {
    lines.push([cell(row.name), ...COLUMNS.map((column) => row[column.key] || 0)].join(','));
  });
  lines.push(['סה"כ', ...COLUMNS.map((column) => totals[column.key] || 0)].join(','));
  return '\uFEFF' + lines.join('\r\n');
}

export default function LastWeekClientsCard({ lastWeek }) {
  if (!lastWeek?.rows?.length) return null;

  const totals = COLUMNS.reduce(
    (acc, column) => ({ ...acc, [column.key]: lastWeek.rows.reduce((sum, row) => sum + (row[column.key] || 0), 0) }),
    {}
  );

  const handleDownload = () => {
    const blob = new Blob([buildCsv(lastWeek.rows, totals)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'לקוחות-חדשים-השבוע-האחרון.csv';
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
              <Building2 className="h-5 w-5 text-teal-500" />
              לקוחות חדשים — השבוע האחרון
            </CardTitle>
            <CardDescription className="mt-1">
              כל המרפאות, השבוע האחרון בלבד: לקוחות חדשים, משלוח טפסי היכרות, החזרה על ידי הלקוח ובדיקות המרפאה
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-1" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            הורדת טבלה
          </Button>
        </div>
        {lastWeek.label && <p className="mt-1 text-xs text-slate-500">שבוע {lastWeek.label}</p>}
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-20 bg-slate-50">
              <tr className="text-xs font-medium text-slate-500">
                <th className="sticky right-0 z-10 bg-slate-50 px-3 py-2 text-right">מרפאה</th>
                {COLUMNS.map((column) => (
                  <th key={column.key} className="whitespace-nowrap px-3 py-2 text-center">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lastWeek.rows.map((row) => (
                <tr key={row.clinicId} className="border-t border-slate-100 hover:bg-teal-50/30">
                  <td className="sticky right-0 bg-white px-3 py-2 text-right font-medium text-slate-700">{row.name}</td>
                  {COLUMNS.map((column) => (
                    <td
                      key={column.key}
                      className={`px-3 py-2 text-center ${row[column.key] ? 'text-slate-700' : 'text-slate-300'}`}
                    >
                      {formatNumber(row[column.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot className="sticky bottom-0 z-20">
              <tr className="border-t-2 border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800">
                <td className="sticky right-0 bg-slate-50 px-3 py-2 text-right">סה"כ</td>
                {COLUMNS.map((column) => (
                  <td key={column.key} className="px-3 py-2 text-center">
                    {formatNumber(totals[column.key])}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}