const pad = (value) => String(value).padStart(2, '0');

const HEADER = ['מרפאה', 'תאריך תחילת שבוע (YYYY-MM-DD)', 'לקוחות חדשים'];

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
  return `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
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
  clinics.forEach((clinic) => {
    weeks.forEach((week) => {
      const value = valueMap.get(`${clinic.id}|${week.key}`);
      lines.push([csvCell(clinic.name), week.key, value === undefined ? '' : String(value)].join(','));
    });
  });

  return '\uFEFF' + lines.join('\r\n');
}

export function parseTemplateCsv(text, clinics = []) {
  const byName = new Map();
  const byId = new Map();
  clinics.forEach((clinic) => {
    byName.set(clinic.name.trim().toLowerCase(), clinic.id);
    byId.set(clinic.id, clinic.id);
  });

  const entries = [];
  const unknownClinics = new Set();
  let skipped = 0;

  String(text || '')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .forEach((line) => {
      if (!line.trim()) return;
      if (line.includes('לקוחות חדשים') || line.includes('new_clients')) return;

      const cells = line.split(/[,\t;]/).map((cell) => cell.replace(/^"|"$/g, '').trim());
      const [clinicRaw, weekRaw, valueRaw] = cells;
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