import React, { useEffect, useRef, useState } from 'react';
import { CalendarPlus, Download, Info, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { buildTemplateCsv, parseTemplateCsv } from '@/components/stats/weeklyClientsCsv';

const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

function WeekRow({ row, canEdit, onSave }) {
  const [value, setValue] = useState(row.newClients || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValue(row.newClients || '');
  }, [row.newClients]);

  const commit = async () => {
    if (!canEdit || isSaving) return;
    const numeric = Number(value) || 0;
    if (numeric === (row.newClients || 0)) return;
    setIsSaving(true);
    try {
      await onSave(row.weekStart, numeric);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <tr className="border-t border-slate-100">
      <td className="py-2 pe-2 text-right text-slate-600">{row.label}</td>
      <td className="py-2">
        {canEdit ? (
          <div className="flex items-center justify-center gap-1">
            <Input
              type="number"
              min="0"
              value={value}
              className="h-8 w-20 text-center"
              onChange={(event) => setValue(event.target.value)}
              onBlur={commit}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.currentTarget.blur();
              }}
            />
            {isSaving && <LoadingSpinner size="sm" />}
          </div>
        ) : (
          <div className="text-center font-medium text-slate-700">{row.newClients || 0}</div>
        )}
      </td>
      <td className="py-2 text-center">
        <span className="font-semibold text-slate-700">{row.sent}</span>
        {row.newClients > 0 && <span className="ms-1 text-xs text-slate-400">{pct(row.sent, row.newClients)}%</span>}
      </td>
      <td className="py-2 text-center">
        <span className="font-semibold text-slate-700">{row.returned}</span>
        {row.newClients > 0 && <span className="ms-1 text-xs text-slate-400">{pct(row.returned, row.newClients)}%</span>}
      </td>
      <td className="py-2 text-center">
        <span className="font-semibold text-slate-700">{row.reviewed}</span>
        {row.newClients > 0 && <span className="ms-1 text-xs text-slate-400">{pct(row.reviewed, row.newClients)}%</span>}
      </td>
    </tr>
  );
}

export default function WeeklyClientsCard({ rows = [], canEdit, onSave, clinics = [], weeklyRecords = [], onImport }) {
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleDownload = () => {
    if (!clinics.length || !rows.length) return;

    const csv = buildTemplateCsv({ clinics, weeks: [...rows].reverse(), records: weeklyRecords });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'לקוחות-חדשים-לפי-שבוע.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !onImport) return;

    const parsed = parseTemplateCsv(await file.text(), clinics);

    if (parsed.unknownClinics.length) {
      toast.error(`לא נמצאו מרפאות בשם: ${parsed.unknownClinics.join(', ')}`);
      return;
    }
    if (!parsed.entries.length) {
      toast.error('לא נמצאו שורות עם מספר לקוחות לייבוא');
      return;
    }
    if (!window.confirm(`לייבא ${parsed.entries.length} שורות? שבועות קיימים יתעדכנו.`)) return;

    setIsImporting(true);
    try {
      const result = await onImport(parsed.entries);
      toast.success(`יובאו ${result.created + result.updated} שבועות (${result.created} חדשים, ${result.updated} עודכנו)`);
    } catch (error) {
      toast.error('הייבוא נכשל. בדקו שהקובץ נשמר בפורמט CSV.');
    } finally {
      setIsImporting(false);
    }
  };

  const totals = rows.reduce(
    (acc, row) => ({
      newClients: acc.newClients + (row.newClients || 0),
      sent: acc.sent + row.sent,
      returned: acc.returned + row.returned,
      reviewed: acc.reviewed + row.reviewed,
    }),
    { newClients: 0, sent: 0, returned: 0, reviewed: 0 }
  );

  return (
    <Card className="border-slate-100 bg-white">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base text-slate-800">
              <CalendarPlus className="h-4 w-4 text-emerald-500" />
              לקוחות חדשים לפי שבוע
            </CardTitle>
            <CardDescription className="mt-1">
              הזינו כמה לקוחות חדשים התקבלו בכל שבוע, או הורידו קובץ אקסל ל-{clinics.length > 1 ? 'כל המרפאות' : 'מרפאה'} ומלאו את המספרים
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={handleDownload}
              disabled={!clinics.length || !rows.length}
            >
              <Download className="h-4 w-4" />
              הורדת קובץ
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting || !clinics.length}
            >
              {isImporting ? <LoadingSpinner size="sm" /> : <Upload className="h-4 w-4" />}
              ייבוא קובץ
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,.txt"
              className="hidden"
              onChange={handleFile}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!canEdit && (
          <div className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>כדי להזין מספר לקוחות חדשים יש לבחור מרפאה ספציפית בסינון שלמעלה.</span>
          </div>
        )}

        <div className="max-h-[380px] overflow-y-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="text-xs font-medium text-slate-500">
                <th className="py-2 pe-2 text-right">שבוע</th>
                <th className="py-2 text-center">לקוחות חדשים</th>
                <th className="py-2 text-center">נשלח טופס</th>
                <th className="py-2 text-center">החזירו</th>
                <th className="py-2 text-center">נבדקו</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <WeekRow key={row.weekStart} row={row} canEdit={canEdit} onSave={onSave} />
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 text-xs text-slate-600">
                <td className="py-2 pe-2 text-right font-medium">סה"כ</td>
                <td className="py-2 text-center font-semibold">{totals.newClients}</td>
                <td className="py-2 text-center font-semibold">{totals.sent}</td>
                <td className="py-2 text-center font-semibold">{totals.returned}</td>
                <td className="py-2 text-center font-semibold">{totals.reviewed}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}