import { useContext } from 'react';

import { ExpenseFormContext } from '@/context/ExpenseFormContext';
import { ExpenseDetailContext } from '@/pages/expenses/context/ExpenseDetailContext';
import { ExpenseFilterContext } from '@/pages/expenses/context/ExpenseFilterContext';

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

export function useExpenseFormContext() {
  const ctx = useContext(ExpenseFormContext);
  if (!ctx) throw new Error('useExpenseFormContext must be used within an ExpenseFormProvider');
  return ctx;
}
