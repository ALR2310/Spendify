import { ChangeEvent, KeyboardEvent, useLayoutEffect, useMemo, useRef, useState } from 'react';

interface Props {
  value?: number | null;
  onChange?: (value: number | null) => void;
  placeholder?: string;
  className?: string;
}

export function CurrencyInput({ value = null, onChange, placeholder = '', className = '' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const SUFFIX = ' đ';

  const formatter = useMemo(() => new Intl.NumberFormat('vi-VN'), []);

  const [internal, setInternal] = useState('');

  useLayoutEffect(() => {
    if (value == null) {
      setInternal('');
      return;
    }
    setInternal(formatter.format(value) + SUFFIX);
  }, [formatter, value]);

  const formatDisplay = (num: number | null) => {
    if (num == null) return '';
    return formatter.format(num) + SUFFIX;
  };

  const extractNumber = (text: string) => {
    const digits = text.replace(/[^\d]/g, '');
    return digits === '' ? null : Number(digits);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const num = extractNumber(e.target.value);
    setInternal(formatDisplay(num));
    onChange?.(num);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!inputRef.current) return;

    const el = inputRef.current;
    const caret = el.selectionStart ?? 0;
    const suffixStart = internal.length - SUFFIX.length;

    const isCaretAfterSuffix = caret > suffixStart;
    const isBackspace = e.key === 'Backspace';

    if (isCaretAfterSuffix && isBackspace) {
      e.preventDefault();

      const num = extractNumber(internal);
      if (num == null) return;

      const newNumStr = String(num).slice(0, -1);
      const newNum = newNumStr === '' ? null : Number(newNumStr);

      setInternal(formatDisplay(newNum));
      onChange?.(newNum);

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
