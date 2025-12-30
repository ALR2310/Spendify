import { useContext } from 'react';

import { CategoryFormContext } from '@/context/CategoryFormContext';

export function useCategoryFormContext() {
  const ctx = useContext(CategoryFormContext);
  if (!ctx) throw new Error('useCategoryFormContext must be used within a CategoryFormProvider');
  return ctx;
}
