import { useContext } from 'react';

import { StatisticFilterContext } from '@/pages/statistics/context/StatisticFilterContext';

export function useStatisticFilterContext() {
  const ctx = useContext(StatisticFilterContext);
  if (!ctx) throw new Error('useStatisticFilterContext must be used within a StatisticFilterProvider');
  return ctx;
}
