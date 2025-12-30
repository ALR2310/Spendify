import { useCallback, useEffect, useState } from 'react';

import { datePickerBus, DatePickerEvents } from './datePickerBus';

let pickerIdCounter = 0;

export function useDatePicker(initial?: Date) {
  const [date, setDate] = useState<Date | undefined>(initial);
  const [pickerId] = useState(() => `date-picker-${++pickerIdCounter}`);

  const open = useCallback(() => {
    datePickerBus.emit('open', { initial: date, pickerId });
  }, [date, pickerId]);

  const close = useCallback(() => {
    datePickerBus.emit('close');
  }, []);

  useEffect(() => {
    const handleDateSelect = (data: DatePickerEvents['select']) => {
      if (data.pickerId === pickerId) {
        setDate(data.date);
      }
    };

    datePickerBus.on('select', handleDateSelect);
    return () => {
      datePickerBus.off('select', handleDateSelect);
    };
  }, [pickerId]);

  return {
    date,
    setDate,
    open,
    close,
  };
}
