import dayjs from 'dayjs';

import { ExpenseListResponse } from '@/common/types/expense.type';

import { formatCurrency } from './general.utils';

export function groupExpenseByDate(expenses: ExpenseListResponse['data']) {
  const groups: Record<string, ExpenseListResponse['data']> = {};

  expenses.forEach((expense) => {
    const key = dayjs(expense.date).format('DD/MM/YYYY');
    if (!groups[key]) groups[key] = [];
    groups[key].push(expense);
  });
  return groups;
}

export function formatCurrencyWithCompact(amount: number) {
  const useCompact = Math.abs(amount) >= 100_000_000;
  return formatCurrency(amount, useCompact ? { notation: 'compact' } : {});
}

export function getCurrentMonth(date?: Date | undefined) {
  const currentDate = date ? dayjs(date) : dayjs();
  return { year: currentDate.year(), month: currentDate.month() + 1 };
}

export function isValidMonthRange(startDate?: Date | null, endDate?: Date | null) {
  if (!startDate || !endDate) return false;

  const start = dayjs(startDate);
  const end = dayjs(endDate);

  if (end.isBefore(start, 'day')) return false;

  return (
    start.isSame(start.startOf('month'), 'day') && end.isSame(end.endOf('month'), 'day') && start.isSame(end, 'month')
  );
}
