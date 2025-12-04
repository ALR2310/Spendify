import { useContext } from 'react';

import { ExpenseUIContext } from '@/pages/expenses/context/ExpenseUIContext';

export function useExpenseContext() {
  const ctx = useContext(ExpenseUIContext);
  if (!ctx) throw new Error('useExpense must be used within an ExpenseProvider');
  return ctx;
}
