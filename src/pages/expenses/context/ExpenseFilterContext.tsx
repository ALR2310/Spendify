import dayjs from 'dayjs';
import { createContext, useCallback, useMemo, useState } from 'react';

import { ExpenseListQuery } from '@/common/types/expense.type';
import { ExpenseTypeEnum } from '@/database/types/tables/expenses';
import { useDatePicker } from '@/global/datepicker';
import { getCurrentMonth, isValidMonthRange } from '@/utils/expense.utils';

interface ExpenseFilterContextValue {
  // Filter states
  type: ExpenseTypeEnum | undefined;
  setType: (type: ExpenseTypeEnum | undefined) => void;
  categoryId: number | undefined;
  setCategoryId: (categoryId: number | undefined) => void;
  sortField: string;
  setSortField: (sortField: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  searchField: string | undefined;
  setSearchField: (searchField: string | undefined) => void;
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
  buildExpenseListQuery: () => ExpenseListQuery;
}

const today = dayjs();

const ExpenseFilterContext = createContext<ExpenseFilterContextValue>(null!);

const ExpenseFilterProvider = ({ children }: { children: React.ReactNode }) => {
  const [type, setType] = useState<ExpenseTypeEnum | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [sortField, setSortField] = useState<string>('expenses.date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchField, setSearchField] = useState<string | undefined>(undefined);

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

  const setMonth = useCallback(
    (year: number, month: number) => {
      const date = dayjs()
        .year(year)
        .month(month - 1);
      setStartDate(date.startOf('month').toDate());
      setEndDate(date.endOf('month').toDate());
    },
    [setEndDate, setStartDate],
  );

  const resetFilters = useCallback(() => {
    setType(undefined);
    setCategoryId(undefined);
    setSortField('expenses.date');
    setSortOrder('desc');
    setSearchField(undefined);
    setStartDate(today.startOf('month').toDate());
    setEndDate(today.endOf('month').toDate());
    setMonth(today.year(), today.month() + 1);
  }, [setEndDate, setMonth, setStartDate]);

  const goToNextMonth = useCallback(() => {
    const isValid = isValidMonthRange(startDate, endDate);

    let { month, year } = getCurrentMonth(isValid ? startDate : new Date());
    if (month < 12) {
      month += 1;
    } else {
      month = 1;
      year += 1;
    }

    setMonth(year, month);
  }, [endDate, setMonth, startDate]);

  const goToPrevMonth = useCallback(() => {
    const isValid = isValidMonthRange(startDate, endDate);

    let { month, year } = getCurrentMonth(isValid ? startDate : new Date());
    if (month > 1) {
      month -= 1;
    } else {
      month = 12;
      year -= 1;
    }

    setMonth(year, month);
  }, [endDate, setMonth, startDate]);

  const buildExpenseListQuery = useCallback(() => {
    const query: ExpenseListQuery = {
      type,
      categoryId,
      searchField,
      sortField,
      sortOrder,
      startDate: startDate && dayjs(startDate).startOf('day').toISOString(),
      endDate: endDate && dayjs(endDate).endOf('day').toISOString(),
    };

    return query;
  }, [categoryId, endDate, searchField, sortField, sortOrder, startDate, type]);

  const ctx = useMemo(
    () => ({
      type,
      setType,
      categoryId,
      setCategoryId,
      sortField,
      setSortField,
      sortOrder,
      setSortOrder,
      searchField,
      setSearchField,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      // Helpers
      resetFilters,
      openStartDatePicker,
      openEndDatePicker,
      goToNextMonth,
      goToPrevMonth,
      buildExpenseListQuery,
    }),
    [
      buildExpenseListQuery,
      categoryId,
      endDate,
      goToNextMonth,
      goToPrevMonth,
      openEndDatePicker,
      openStartDatePicker,
      resetFilters,
      searchField,
      setEndDate,
      setStartDate,
      sortField,
      sortOrder,
      startDate,
      type,
    ],
  );

  return <ExpenseFilterContext.Provider value={ctx}>{children}</ExpenseFilterContext.Provider>;
};

export { ExpenseFilterContext, ExpenseFilterProvider };
export type { ExpenseFilterContextValue };
