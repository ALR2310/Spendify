import { useContext, useState } from 'react';

import { MonthPickerContext, MonthValue } from '@/context/MonthPickerContext';

export function useMonthPickerContext() {
  const ctx = useContext(MonthPickerContext);
  if (!ctx) {
    throw new Error('useMonthPickerContext must be used within a MonthPickerProvider');
  }

  const [month, setMonth] = useState<MonthValue | undefined>();

  const open = (initial?: MonthValue) => {
    ctx.open(initial ?? month, (picked) => {
      if (picked !== undefined) {
        setMonth(picked);
      }
    });
  };

  return { month, setMonth, open, close: ctx.close };
}
