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
