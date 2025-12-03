import { useContext } from 'react';

import { ExpenseContext } from '@/context/ExpenseContext';

export function useExpenseContext() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpense must be used within an ExpenseProvider');
  return ctx;
}
