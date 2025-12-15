import dayjs from 'dayjs';
import { createContext, useCallback, useMemo, useState } from 'react';

import { ExpenseListQuery } from '@/common/types/expense.type';
import { ExpenseTypeEnum } from '@/database/types/tables/expenses';

interface ExpenseFilterContextValue {
  // Filter states
  type: ExpenseTypeEnum | null;
  setType: (type: ExpenseTypeEnum | null) => void;
  categoryId: number | null;
  setCategoryId: (categoryId: number | null) => void;
  sortField: string;
  setSortField: (sortField: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  searchField: string | undefined;
  setSearchField: (searchField: string | undefined) => void;
  startDate: Date | null;
  setStartDate: (dateFrom: Date | null) => void;
  endDate: Date | null;
  setEndDate: (dateTo: Date | null) => void;

  // Derived month from startDate/endDate
  getCurrentMonth: () => { year: number; month: number } | null;
  isValidMonthRange: () => boolean;
  setMonthRange: (year: number, month: number) => void;
  goToNextMonth: () => void;
  goToPreviousMonth: () => void;

  buildExpenseListQuery: (monthValue?: { year: number; month: number } | null) => ExpenseListQuery;
  resetFilters: () => void;
}

const ExpenseFilterContext = createContext<ExpenseFilterContextValue>(null!);

export const ExpenseFilterProvider = ({ children }: { children: React.ReactNode }) => {
  const [type, setType] = useState<ExpenseTypeEnum | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<string>('expenses.date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchField, setSearchField] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Helper function to get current month from startDate/endDate
  const getCurrentMonth = useCallback((): { year: number; month: number } | null => {
    if (!startDate || !endDate) return null;

    const start = dayjs(startDate);
    const end = dayjs(endDate);

    // Check if both dates are in the same month
    if (start.year() === end.year() && start.month() === end.month()) {
      // Check if it covers the full month
      const monthStart = start.clone().startOf('month');
      const monthEnd = start.clone().endOf('month');

      if (start.isSame(monthStart, 'day') && end.isSame(monthEnd, 'day')) {
        return { year: start.year(), month: start.month() + 1 };
      }
    }

    return null;
  }, [startDate, endDate]);

  // Check if current date range is a valid month range
  const isValidMonthRange = useCallback((): boolean => {
    return getCurrentMonth() !== null;
  }, [getCurrentMonth]);

  // Set date range for a specific month
  const setMonthRange = useCallback((year: number, month: number) => {
    const start = dayjs(`${year}-${month}-01`).startOf('day');
    const end = start.endOf('month').endOf('day');
    setStartDate(start.toDate());
    setEndDate(end.toDate());
  }, []);

  // Navigate to next month
  const goToNextMonth = useCallback(() => {
    const current = getCurrentMonth();
    if (!current) return;

    let { year, month } = current;
    if (month < 12) {
      month += 1;
    } else {
      year += 1;
      month = 1;
    }
    setMonthRange(year, month);
  }, [getCurrentMonth, setMonthRange]);

  // Navigate to previous month
  const goToPreviousMonth = useCallback(() => {
    const current = getCurrentMonth();
    if (!current) return;

    let { year, month } = current;
    if (month > 1) {
      month -= 1;
    } else {
      year -= 1;
      month = 12;
    }
    setMonthRange(year, month);
  }, [getCurrentMonth, setMonthRange]);

  const buildExpenseListQuery = useCallback(
    (monthValue?: { year: number; month: number } | null): ExpenseListQuery => {
      const query: ExpenseListQuery = {
        sortField,
        sortOrder,
      };

      if (searchField) query.searchField = searchField;
      if (type) query.type = type;
      if (categoryId) query.categoryId = categoryId;

      // Use startDate/endDate if they are set
      if (startDate || endDate) {
        if (startDate) query.startDate = dayjs(startDate).startOf('day').toISOString();
        if (endDate) query.endDate = dayjs(endDate).endOf('day').toISOString();
      } else if (monthValue) {
        // Fallback to monthValue parameter if provided
        const { year: y, month: m } = monthValue;
        if (y && m) {
          const start = dayjs(`${y}-${m}-01`).startOf('day');
          const end = start.endOf('month').endOf('day');
          query.startDate = start.toISOString();
          query.endDate = end.toISOString();
        }
      }

      return query;
    },
    [sortField, sortOrder, searchField, type, categoryId, startDate, endDate],
  );

  const resetFilters = useCallback(() => {
    setType(null);
    setCategoryId(null);
    setSortField('expenses.date');
    setSortOrder('desc');
    setSearchField(undefined);

    // Reset to current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const start = dayjs(`${year}-${month}-01`).startOf('day');
    const end = start.endOf('month').endOf('day');
    setStartDate(start.toDate());
    setEndDate(end.toDate());
  }, []);

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
      getCurrentMonth,
      isValidMonthRange,
      setMonthRange,
      goToNextMonth,
      goToPreviousMonth,
      buildExpenseListQuery,
      resetFilters,
    }),
    [
      type,
      categoryId,
      sortField,
      sortOrder,
      searchField,
      startDate,
      endDate,
      buildExpenseListQuery,
      resetFilters,
      getCurrentMonth,
      isValidMonthRange,
      setMonthRange,
      goToNextMonth,
      goToPreviousMonth,
    ],
  );

  return <ExpenseFilterContext.Provider value={ctx}>{children}</ExpenseFilterContext.Provider>;
};

export { ExpenseFilterContext };
