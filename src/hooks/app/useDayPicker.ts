import { useContext, useState } from 'react';

import { DayPickerContext } from '@/context/DayPickerContext';

export function useDayPickerContext() {
  const ctx = useContext(DayPickerContext);
  if (!ctx) {
    throw new Error('useDayPickerContext must be used within a DayPickerProvider');
  }

  const [date, setDate] = useState<Date | undefined>();

  const open = (initial?: Date) => {
    ctx.open(initial ?? date, (picked) => {
      if (picked !== undefined) {
        setDate(picked);
      }
    });
  };

  return { date, setDate, open, close: ctx.close };
}
