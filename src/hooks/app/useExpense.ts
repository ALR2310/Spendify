import { useContext } from 'react';

import { ExpenseFormContext } from '@/context/ExpenseFormContext';
import { ExpenseDetailContext } from '@/pages/expenses/context/ExpenseDetailContext';
import { ExpenseFilterContext } from '@/pages/expenses/context/ExpenseFilterContext';
import { RecurringDetailContext } from '@/pages/expenses/context/RecurringDetailContext';

export function useExpenseDetailContext() {
  const ctx = useContext(ExpenseDetailContext);
  if (!ctx) throw new Error('useExpenseDetailContext must be used within an ExpenseDetailProvider');
  return ctx;
}

export function useRecurringDetailContext() {
  const ctx = useContext(RecurringDetailContext);
  if (!ctx) throw new Error('useRecurringDetailContext must be used within a RecurringDetailProvider');
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
