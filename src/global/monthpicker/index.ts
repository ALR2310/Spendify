import { useCallback, useEffect, useState } from 'react';

import { monthPickerBus, MonthPickerEvents } from './monthPickerBus';

let pickerIdCounter = 0;

export function useMonthPicker(initial?: Date) {
  const [month, setMonth] = useState<Date | undefined>(initial);
  const [pickerId] = useState(() => `month-picker-${++pickerIdCounter}`);

  const open = useCallback(() => {
    monthPickerBus.emit('open', { initial: month, pickerId });
  }, [month, pickerId]);

  const close = useCallback(() => {
    monthPickerBus.emit('close');
  }, []);

  useEffect(() => {
    const handleMonthSelect = (data: MonthPickerEvents['select']) => {
      if (data.pickerId === pickerId) {
        setMonth(data.month);
      }
    };

    monthPickerBus.on('select', handleMonthSelect);
    return () => {
      monthPickerBus.off('select', handleMonthSelect);
    };
  }, [pickerId]);

  return {
    month,
    setMonth,
    open,
    close,
  };
}
