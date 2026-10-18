/**
 * Formats a number to Indonesian Rupiah currency format.
 * Example: 2400000 -> "Rp 2.400.000"
 */
export function formatRupiah(amount: number | undefined | null, showDashIfZero = false): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return showDashIfZero ? '-' : 'Rp 0';
  }
  if (amount === 0 && showDashIfZero) {
    return '-';
  }
  const formatted = Math.round(amount).toLocaleString('id-ID');
  return `Rp ${formatted}`;
}

/**
 * Returns plain number string formatted with thousands separator for inputs
 */
export function formatNumberWithDots(val: number | string): string {
  if (val === '' || val === undefined || val === null) return '';
  const clean = String(val).replace(/\D/g, '');
  if (!clean) return '';
  return Number(clean).toLocaleString('id-ID');
}

/**
 * Parses numeric input value string by stripping non-numeric characters
 */
export function parseNumberFromDots(val: string): number {
  if (!val) return 0;
  const clean = val.replace(/\D/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

/**
 * Returns ISO date string (YYYY-MM-DD) for HTML date inputs
 */
export function getTodayISODate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts ISO date (YYYY-MM-DD) to Indonesian format (DD/MM/YYYY)
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr || dateStr === '-') return '-';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function getCurrentMonthName(): string {
  return INDONESIAN_MONTHS[new Date().getMonth()];
}
