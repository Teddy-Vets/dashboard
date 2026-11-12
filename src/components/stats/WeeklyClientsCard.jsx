import React, { useEffect, useState } from 'react';
import { CalendarPlus, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/common/LoadingSpinner';

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

export default function WeeklyClientsCard({ rows = [], canEdit, onSave }) {
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
        <CardTitle className="flex items-center gap-2 text-base text-slate-800">
          <CalendarPlus className="h-4 w-4 text-emerald-500" />
          לקוחות חדשים לפי שבוע
        </CardTitle>
        <CardDescription>
          הזינו כמה לקוחות חדשים התקבלו בכל שבוע, ותראו לכמה מהם נשלח טופס היכרות, כמה החזירו אותו וכמה נבדקו
        </CardDescription>
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