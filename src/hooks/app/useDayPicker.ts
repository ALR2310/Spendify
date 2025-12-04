import { useContext, useState } from 'react';

import { DayPickerContext } from '@/context/DayPickerContext';

export function useDayPickerContext(initial?: Date) {
  const [date, setDate] = useState<Date | undefined>(initial);
  const { openPicker, closePicker } = useContext(DayPickerContext);

  const open = async () => {
    const result = await openPicker(date);

    if (result !== undefined) {
      setDate(result);
    }
  };

  return { date, open, close: closePicker };
}
