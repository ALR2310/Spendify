import { useContext } from 'react';

import { AppContext } from '@/context/AppContext';

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within an AppProvider');
  return ctx;
}
