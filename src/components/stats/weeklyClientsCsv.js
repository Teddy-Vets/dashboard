const pad = (value) => String(value).padStart(2, '0');
const DAY_MS = 24 * 60 * 60 * 1000;

const HEADER = ['שבוע', 'חודש', 'תאריך התחלה', 'תאריך סיום', 'מרפאה', 'לקוחות חדשים'];

function parseDateValue(raw) {
  const text = String(raw || '').trim();
  if (!text) return null;

  let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));

  match = text.match(/^(\d{1,2})[./](\d{1,2})[./](\d{2,4})$/);
  if (match) {
    const year = match[3].length === 2 ? 2000 + Number(match[3]) : Number(match[3]);
    return new Date(year, Number(match[2]) - 1, Number(match[1]));
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toWeekStart(raw) {
  const date = parseDateValue(raw);
  if (!date) return null;
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
  return formatDate(start);
}

export function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function weekOfYear(date) {
  const firstOfYear = new Date(date.getFullYear(), 0, 1);
  const firstSunday = new Date(date.getFullYear(), 0, 1 + ((7 - firstOfYear.getDay()) % 7));
  const diffDays = Math.round((date.getTime() - firstSunday.getTime()) / DAY_MS);
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildTemplateCsv({ clinics = [], weeks = [], records = [] }) {
  const valueMap = new Map();
  records.forEach((record) => {
    valueMap.set(`${record.clinic_id}|${record.week_start}`, record.new_clients || 0);
  });

  const lines = [HEADER.join(',')];
  weeks.forEach((week) => {
    const start = parseDateValue(week.key);
    if (!start) return;
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
    const weekNumber = weekOfYear(start);
    const month = start.getMonth() + 1;

    clinics.forEach((clinic) => {
      const value = valueMap.get(`${clinic.id}|${week.key}`);
      lines.push([
        weekNumber,
        month,
        week.key,
        formatDate(end),
        csvCell(clinic.name),
        value === undefined ? '' : String(value),
      ].join(','));
    });
  });

  return '\uFEFF' + lines.join('\r\n');
}

function detectColumns(headerCells) {
  const clinicIndex = headerCells.findIndex((cell) => cell === 'מרפאה' || /clinic/i.test(cell));
  const valueIndex = headerCells.findIndex((cell) => cell.includes('לקוחות') || /new_clients/i.test(cell));
  const dateIndex = headerCells.findIndex((cell) => cell.startsWith('תאריך') || /week_start/i.test(cell));

  if (clinicIndex >= 0 && valueIndex >= 0 && dateIndex >= 0) {
    return { clinicIndex, valueIndex, dateIndex };
  }
  return null;
}

export function parseTemplateCsv(text, clinics = []) {
  const byName = new Map();
  const byId = new Map();
  clinics.forEach((clinic) => {
    byName.set(String(clinic.name || '').trim().toLowerCase(), clinic.id);
    byId.set(clinic.id, clinic.id);
  });

  const entries = [];
  const unknownClinics = new Set();
  let skipped = 0;
  let columns = null;

  String(text || '')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .forEach((line) => {
      if (!line.trim()) return;

      const cells = line.split(/[,\t;]/).map((cell) => cell.replace(/^"|"$/g, '').trim());

      if (!columns) {
        const detected = detectColumns(cells);
        if (detected) {
          columns = detected;
          return;
        }
        columns = { clinicIndex: 0, valueIndex: 2, dateIndex: 1 };
      }

      const clinicRaw = cells[columns.clinicIndex];
      const weekRaw = cells[columns.dateIndex];
      const valueRaw = cells[columns.valueIndex];

      if (!clinicRaw || !weekRaw) {
        skipped += 1;
        return;
      }

      const clinicId = byName.get(clinicRaw.toLowerCase()) || byId.get(clinicRaw);
      if (!clinicId) {
        unknownClinics.add(clinicRaw);
        return;
      }

      if (valueRaw === undefined || valueRaw === '') return;

      const number = Number(String(valueRaw).replace(/[^\d.-]/g, ''));
      const weekStart = toWeekStart(weekRaw);
      if (!Number.isFinite(number) || number < 0 || !weekStart) {
        skipped += 1;
        return;
      }

      entries.push({ clinic_id: clinicId, week_start: weekStart, new_clients: Math.round(number) });
    });

  return { entries, skipped, unknownClinics: Array.from(unknownClinics) };
}