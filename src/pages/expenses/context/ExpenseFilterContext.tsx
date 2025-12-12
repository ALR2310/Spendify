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
  dateFrom: Date | null;
  setDateFrom: (dateFrom: Date | null) => void;
  dateTo: Date | null;
  setDateTo: (dateTo: Date | null) => void;

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
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
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
      if (dateFrom || dateTo) {
        if (dateFrom) query.dateFrom = dayjs(dateFrom).startOf('day').toISOString();
        if (dateTo) query.dateTo = dayjs(dateTo).endOf('day').toISOString();
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
    [sortField, sortOrder, searchField, type, categoryId, dateFrom, dateTo, month],
  );

  const resetFilters = useCallback(() => {
    setType(null);
    setCategoryId(null);
    setSortField('expenses.date');
    setSortOrder('desc');
    setSearchField(undefined);
    setDateFrom(null);
    setDateTo(null);

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
      dateFrom,
      setDateFrom,
      dateTo,
      setDateTo,
      month,
      setMonth,
      buildExpenseListQuery,
      resetFilters,
    }),
    [type, categoryId, sortField, sortOrder, searchField, dateFrom, dateTo, month, buildExpenseListQuery, resetFilters],
  );

  return <ExpenseFilterContext.Provider value={ctx}>{children}</ExpenseFilterContext.Provider>;
};

export { ExpenseFilterContext };
