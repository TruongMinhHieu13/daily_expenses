/**
 * Formatting helpers for Vietnamese currency, dates, and number inputs
 */

export function formatVND(amount: number, showSymbol = true): string {
  const rounded = Math.round(amount || 0);
  const formatted = new Intl.NumberFormat('vi-VN').format(rounded);
  return showSymbol ? `${formatted} ₫` : formatted;
}

export function formatCompactVND(amount: number): string {
  if (!amount || amount === 0) return '0';
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) {
    const val = (abs / 1_000_000_000).toFixed(1).replace('.0', '');
    return `${val}tỷ`;
  }
  if (abs >= 1_000_000) {
    const val = (abs / 1_000_000).toFixed(1).replace('.0', '');
    return `${val}tr`;
  }
  if (abs >= 1_000) {
    const val = Math.round(abs / 1_000);
    return `${val}k`;
  }
  return String(abs);
}

export function formatCalendarFullAmount(amount: number): string {
  if (!amount || amount === 0) return '0';
  const rounded = Math.round(Math.abs(amount));
  return new Intl.NumberFormat('vi-VN').format(rounded);
}

export function parseCurrencyInput(value: string): number {
  if (!value) return 0;
  // Remove non-digit characters
  const cleanStr = value.replace(/[^\d]/g, '');
  return cleanStr ? parseInt(cleanStr, 10) : 0;
}

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatMonthVN(monthStr: string): string {
  if (!monthStr || !monthStr.includes('-')) return '';
  const [year, month] = monthStr.split('-');
  return `Tháng ${parseInt(month, 10)}/${year}`;
}

export function formatMonthFullVN(monthStr: string): string {
  if (!monthStr || !monthStr.includes('-')) return '';
  const [year, month] = monthStr.split('-');
  return `Tháng ${parseInt(month, 10)}, ${year}`;
}

export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  const today = getTodayString();

  const now = new Date();
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(now.getDate() - 1);
  const yesterdayStr = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

  if (dateStr === today) {
    return 'Hôm nay';
  }
  if (dateStr === yesterdayStr) {
    return 'Hôm qua';
  }

  const [year, month, day] = dateStr.split('-');
  const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const dayOfWeek = daysOfWeek[dateObj.getDay()];

  return `${dayOfWeek}, ${day}/${month}/${year}`;
}

export function formatFullDateVN(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayOfWeek = daysOfWeek[dateObj.getDay()];

  return `${dayOfWeek}, ${day} tháng ${month}, ${year}`;
}
