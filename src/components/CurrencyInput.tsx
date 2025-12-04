import { ChangeEvent, KeyboardEvent, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  value?: number | null;
  onChange?: (value: number) => void;
  placeholder?: string;
  className?: string;
  currencyCode?: string;
  locale?: string;
}

const getLocaleFromLanguage = (language: string): string => {
  const localeMap: Record<string, string> = {
    en: 'en-US',
    vi: 'vi-VN',
  };
  return localeMap[language] || 'vi-VN';
};

const getCurrencySymbol = (formatted: string, currencyCode: string): string => {
  const cleaned = formatted.replace(/[\d.,\s]/g, '');
  if (cleaned.trim()) return cleaned.trim();

  const locales = ['en-US', 'vi-VN', 'en-GB'];
  for (const loc of locales) {
    try {
      const formatter = new Intl.NumberFormat(loc, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      const sample = formatter.format(0);
      const symbol = sample.replace(/[\d.,\s]/g, '').trim();
      if (symbol) return symbol;
    } catch {}
  }

  return currencyCode;
};

export function CurrencyInput({
  value = null,
  onChange,
  placeholder = '',
  className = '',
  currencyCode = 'VND',
  locale,
}: Props) {
  const { i18n } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const resolvedLocale = useMemo(() => {
    if (locale) return locale;
    return getLocaleFromLanguage(i18n.language);
  }, [locale, i18n.language]);

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(resolvedLocale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
    [resolvedLocale],
  );

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(resolvedLocale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    [resolvedLocale, currencyCode],
  );

  const currencySymbol = useMemo(() => {
    const sample = currencyFormatter.format(0);
    return getCurrencySymbol(sample, currencyCode);
  }, [currencyFormatter, currencyCode]);

  const [internal, setInternal] = useState('');

  useLayoutEffect(() => {
    if (value == null) {
      setInternal('');
      return;
    }
    const formatted = numberFormatter.format(value);
    setInternal(formatted + ' ' + currencySymbol);
  }, [numberFormatter, currencySymbol, value]);

  const formatDisplay = (num: number | null) => {
    if (num == null) return '';
    const formatted = numberFormatter.format(num);
    return formatted + ' ' + currencySymbol;
  };

  const extractNumber = (text: string) => {
    const digits = text.replace(/[^\d]/g, '');
    return digits === '' ? null : Number(digits);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const num = extractNumber(e.target.value);
    setInternal(formatDisplay(num));
    onChange?.(num ?? 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!inputRef.current) return;

    const el = inputRef.current;
    const caret = el.selectionStart ?? 0;
    const suffix = '' + currencySymbol;
    const suffixStart = internal.length - suffix.length;

    const isCaretAfterSuffix = caret > suffixStart;
    const isBackspace = e.key === 'Backspace';

    if (isCaretAfterSuffix && isBackspace) {
      e.preventDefault();

      const num = extractNumber(internal);
      if (num == null) return;

      const newNumStr = String(num).slice(0, -1);
      const newNum = newNumStr === '' ? null : Number(newNumStr);

      setInternal(formatDisplay(newNum));
      onChange?.(newNum ?? 0);

      requestAnimationFrame(() => {
        const pos = (formatDisplay(newNum) || '').length;
        el.setSelectionRange(pos, pos);
      });
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      className={`input input-lg ${className}`}
      value={internal}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      inputMode="numeric"
    />
  );
}
