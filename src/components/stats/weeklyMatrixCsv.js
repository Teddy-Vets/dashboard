function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildMatrixCsv({ clinics = [], rows = [], clinicTotals = [], grandTotal = 0 }) {
  const header = ['שבוע', ...clinics.map((clinic) => csvCell(clinic.name)), 'סה"כ'];
  const lines = [header.join(',')];

  rows.forEach((row) => {
    lines.push([csvCell(row.label), ...row.values.map((value) => value || 0), row.total || 0].join(','));
  });

  lines.push(['סה"כ', ...clinicTotals.map((value) => value || 0), grandTotal || 0].join(','));

  return '\uFEFF' + lines.join('\r\n');
}