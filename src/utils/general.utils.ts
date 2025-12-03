export function abbreviateNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1_000_000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  if (num < 1_000_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
}

export function formatCurrency(amount: number, currencyCode = 'VND', locale = 'vi-VN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function getMonthLabel(month: number, locale: string) {
  return new Intl.DateTimeFormat(locale, { month: 'long' })
    .format(new Date(2024, month - 1))
    .replace(/^\w/, (c) => c.toUpperCase());
}
