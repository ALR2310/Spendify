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
  dayFrom: Date | null;
  setDayFrom: (dayFrom: Date | null) => void;
  dayTo: Date | null;
  setDayTo: (dayTo: Date | null) => void;

  month: { year: number; month: number } | null;
  setMonth: (month: { year: number; month: number } | null) => void;

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
  const [dayFrom, setDayFrom] = useState<Date | null>(null);
  const [dayTo, setDayTo] = useState<Date | null>(null);
  const [month, setMonth] = useState<{ year: number; month: number } | null>(null);

  const buildExpenseListQuery = useCallback(
    (monthValue?: { year: number; month: number } | null): ExpenseListQuery => {
      const query: ExpenseListQuery = {
        sortField,
        sortOrder,
      };

      if (searchField) query.searchField = searchField;
      if (type) query.type = type;
      if (categoryId) query.categoryId = categoryId;

      // Priority: dayFrom/dayTo > month filter
      if (dayFrom || dayTo) {
        if (dayFrom) query.dateFrom = dayjs(dayFrom).startOf('day').toISOString();
        if (dayTo) query.dateTo = dayjs(dayTo).endOf('day').toISOString();
      } else if (monthValue || month) {
        const { year: y, month: m } = monthValue || month || {};
        if (y && m) {
          const startDate = dayjs(`${y}-${m}-01`).startOf('day');
          const endDate = startDate.endOf('month').endOf('day');
          query.dateFrom = startDate.toISOString();
          query.dateTo = endDate.toISOString();
        }
      }

      return query;
    },
    [sortField, sortOrder, searchField, type, categoryId, dayFrom, dayTo, month],
  );

  const resetFilters = useCallback(() => {
    setType(null);
    setCategoryId(null);
    setSortField('expenses.date');
    setSortOrder('desc');
    setSearchField(undefined);
    setDayFrom(null);
    setDayTo(null);

    // Reset month to current month
    const now = new Date();
    setMonth({ year: now.getFullYear(), month: now.getMonth() + 1 });
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
      dayFrom,
      setDayFrom,
      dayTo,
      setDayTo,
      month,
      setMonth,
      buildExpenseListQuery,
      resetFilters,
    }),
    [type, categoryId, sortField, sortOrder, searchField, dayFrom, dayTo, month, buildExpenseListQuery, resetFilters],
  );

  return <ExpenseFilterContext.Provider value={ctx}>{children}</ExpenseFilterContext.Provider>;
};

export { ExpenseFilterContext };
