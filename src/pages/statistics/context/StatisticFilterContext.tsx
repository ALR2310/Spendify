import dayjs from 'dayjs';
import { createContext, useCallback, useMemo, useState } from 'react';

import { useDatePicker } from '@/global/datepicker';
import { getCurrentMonth, isValidMonthRange } from '@/utils/expense.utils';

const today = dayjs();

const setMonthRange = (
  year: number,
  month: number,
  setStartDate: (date?: Date) => void,
  setEndDate: (date?: Date) => void,
) => {
  const date = dayjs()
    .year(year)
    .month(month - 1);
  setStartDate(date.startOf('month').toDate());
  setEndDate(date.endOf('month').toDate());
};

interface StatisticFilterContextValue {
  // Filter states
  categoryIds: number[];
  setCategoryIds: (categoryIds: number[]) => void;
  startDate: Date | undefined;
  setStartDate: (dateFrom: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (dateTo: Date | undefined) => void;

  // Helpers
  resetFilters: () => void;
  openStartDatePicker: () => void;
  openEndDatePicker: () => void;
  goToNextMonth: () => void;
  goToPrevMonth: () => void;
}

const StatisticFilterContext = createContext<StatisticFilterContextValue>(null!);

const StatisticFilterProvider = ({ children }: { children: React.ReactNode }) => {
  const [categoryIds, setCategoryIds] = useState<number[]>([]);

  const {
    date: startDate,
    setDate: setStartDate,
    open: openStartDatePicker,
  } = useDatePicker(today.startOf('month').toDate());
  const {
    date: endDate,
    setDate: setEndDate,
    open: openEndDatePicker,
  } = useDatePicker(today.endOf('month').toDate());

  const resetFilters = useCallback(() => {
    setCategoryIds([]);
    setStartDate(today.startOf('month').toDate());
    setEndDate(today.endOf('month').toDate());
  }, [setEndDate, setStartDate]);

  const goToNextMonth = useCallback(() => {
    const isValid = isValidMonthRange(startDate, endDate);

    let { month, year } = getCurrentMonth(isValid ? startDate : new Date());
    if (month < 12) {
      month += 1;
    } else {
      month = 1;
      year += 1;
    }

    setMonthRange(year, month, setStartDate, setEndDate);
  }, [endDate, setEndDate, setStartDate, startDate]);

  const goToPrevMonth = useCallback(() => {
    const isValid = isValidMonthRange(startDate, endDate);

    let { month, year } = getCurrentMonth(isValid ? startDate : new Date());
    if (month > 1) {
      month -= 1;
    } else {
      month = 12;
      year -= 1;
    }

    setMonthRange(year, month, setStartDate, setEndDate);
  }, [endDate, setEndDate, setStartDate, startDate]);

  const ctx = useMemo(
    () => ({
      categoryIds,
      setCategoryIds,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      resetFilters,
      openStartDatePicker,
      openEndDatePicker,
      goToNextMonth,
      goToPrevMonth,
    }),
    [
      categoryIds,
      endDate,
      goToNextMonth,
      goToPrevMonth,
      openEndDatePicker,
      openStartDatePicker,
      resetFilters,
      setEndDate,
      setStartDate,
      startDate,
    ],
  );

  return <StatisticFilterContext.Provider value={ctx}>{children}</StatisticFilterContext.Provider>;
};

export { StatisticFilterContext, StatisticFilterProvider };
export type { StatisticFilterContextValue };
