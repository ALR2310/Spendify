import dayjs from 'dayjs';

import { ExpenseListResponse } from '@/common/types/expense.type';

export function groupExpenseByDate(expenses: ExpenseListResponse['data']) {
  const groups: Record<string, ExpenseListResponse['data']> = {};

  expenses.forEach((expense) => {
    const key = dayjs(expense.date).format('DD/MM/YYYY');
    if (!groups[key]) groups[key] = [];
    groups[key].push(expense);
  });
  return groups;
}
