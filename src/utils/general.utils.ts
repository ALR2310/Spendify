export function abbreviateNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1_000_000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  if (num < 1_000_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
}

export function formatCurrency(
  amount: number,
  opts: {
    locale?: string;
    currencyCode?: string;
    notation?: 'standard' | 'compact';
    minFractionDigits?: number;
    maxFractionDigits?: number;
    shortCurrency?: boolean;
  } = {},
): string {
  const {
    locale = 'vi-VN',
    currencyCode = 'VND',
    notation = 'standard',
    minFractionDigits,
    maxFractionDigits,
    shortCurrency = false,
  } = opts;

  const currencyInfo = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).resolvedOptions();

  const minimumFractionDigits = minFractionDigits ?? currencyInfo.minimumFractionDigits;
  const maximumFractionDigits = maxFractionDigits ?? currencyInfo.maximumFractionDigits;

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    notation,
    minimumFractionDigits,
    maximumFractionDigits,
  });

  let formatted = formatter.format(amount);

  if (shortCurrency) {
    const shortMap: Record<string, string> = {
      VND: '₫',
      USD: '$',
      EUR: '€',
      JPY: '¥',
      GBP: '£',
    };

    const short = shortMap[currencyCode] ?? currencyCode;

    const numberPart = new Intl.NumberFormat(locale, {
      notation,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);

    formatted = `${numberPart} ${short}`;
  }

  return formatted;
}

export function getMonthLabel(month: number, locale: string) {
  return new Intl.DateTimeFormat(locale, { month: 'long' })
    .format(new Date(2024, month - 1))
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${value} ${sizes[i]}`;
}
