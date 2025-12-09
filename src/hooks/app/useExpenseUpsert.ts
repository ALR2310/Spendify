import { useContext } from 'react';

import { ExpenseUpsertContext } from '@/pages/expenses/context/ExpenseUpsertContext';

export function useExpenseUpsertContext() {
  const ctx = useContext(ExpenseUpsertContext);
  if (!ctx) throw new Error('useExpenseUpsertContext must be used within an ExpenseUpsertProvider');
  return ctx;
}
