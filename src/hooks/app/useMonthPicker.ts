import { useContext, useState } from 'react';

import { MonthPickerContext, MonthValue } from '@/context/MonthPickerContext';

export function useMonthPickerContext(initial?: MonthValue) {
  const [monthValue, setMonthValue] = useState<MonthValue | undefined>(initial);

  const { openPicker, closePicker, setValue: setProviderValue } = useContext(MonthPickerContext);

  const open = async () => {
    const result = await openPicker(monthValue);
    if (result !== undefined) setMonthValue(result);
  };

  const setValue = (v: MonthValue) => {
    setMonthValue(v);
    setProviderValue(v);
  };

  return { value: monthValue, open, close: closePicker, setValue };
}
