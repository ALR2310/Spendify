import { useContext } from 'react';

import { ExpenseUpsertContext } from '@/context/ExpenseUpsertContext';
import { ExpenseDetailContext } from '@/pages/expenses/context/ExpenseDetailContext';
import { ExpenseFilterContext } from '@/pages/expenses/context/ExpenseFilterContext';

export function useExpenseUpsertContext() {
  const ctx = useContext(ExpenseUpsertContext);
  if (!ctx) throw new Error('useExpenseUpsertContext must be used within an ExpenseUpsertProvider');
  return ctx;
}

export function useExpenseDetailContext() {
  const ctx = useContext(ExpenseDetailContext);
  if (!ctx) throw new Error('useExpenseDetailContext must be used within an ExpenseDetailProvider');
  return ctx;
}

export function useExpenseFilterContext() {
  const ctx = useContext(ExpenseFilterContext);
  if (!ctx) throw new Error('useExpenseFilterContext must be used within an ExpenseFilterProvider');
  return ctx;
}
