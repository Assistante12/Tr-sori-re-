/**
 * Formatting utilities for Ariary currency and dates
 */

export function formatAriary(amount: number | null | undefined, showSymbol = true): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '0 Ar' : '0';
  }
  const rounded = Math.round(amount);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return showSymbol ? `${formatted} Ar` : formatted;
}

export function parseNumber(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  const clean = value.toString().replace(/[^\d.-]/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatDateFR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function getTodayISODate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const COMMON_UNITS = [
  { value: 'pièce', label: 'pièce (pc)' },
  { value: 'Kp', label: 'Kp (kapoaka / kg)' },
  { value: 'TK', label: 'TK (tapoaka / tas)' },
  { value: 'kg', label: 'kg (kilogramme)' },
  { value: 'litre', label: 'litre (l)' },
  { value: 'botte', label: 'botte' },
  { value: 'paquet', label: 'paquet' },
  { value: 'sac', label: 'sac' },
  { value: 'carton', label: 'carton' },
  { value: 'gobelet', label: 'gobelet' },
];

export const FREQUENT_PRODUCTS = [
  { designation: 'Gouter', defaultUnit: 'pièce', defaultPrice: 500 },
  { designation: 'Sosoa', defaultUnit: 'Kp', defaultPrice: 600 },
  { designation: 'Kabaka filao maina', defaultUnit: 'TK', defaultPrice: 1000 },
  { designation: 'Vary alvandro', defaultUnit: 'Kp', defaultPrice: 600 },
  { designation: 'Felimafana', defaultUnit: 'TK', defaultPrice: 500 },
  { designation: 'Tomate', defaultUnit: 'pièce', defaultPrice: 100 },
  { designation: 'Tongolo', defaultUnit: 'pièce', defaultPrice: 100 },
  { designation: 'Angivy', defaultUnit: 'TK', defaultPrice: 500 },
  { designation: 'Batata', defaultUnit: 'TK', defaultPrice: 2000 },
  { designation: 'Vary atiana', defaultUnit: 'Kp', defaultPrice: 600 },
  { designation: 'Flao filapia maina', defaultUnit: 'TK', defaultPrice: 4000 },
  { designation: 'Mahango', defaultUnit: 'TK', defaultPrice: 1000 },
  { designation: 'Sira', defaultUnit: 'kg', defaultPrice: 1300 },
  { designation: 'Menaka', defaultUnit: 'litre', defaultPrice: 6000 },
  { designation: 'Siramamy', defaultUnit: 'kg', defaultPrice: 3800 },
  { designation: 'Atody', defaultUnit: 'pièce', defaultPrice: 800 },
];
