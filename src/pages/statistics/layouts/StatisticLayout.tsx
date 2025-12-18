import { Outlet } from 'react-router';

import { StatisticFilterProvider } from '../context/StatisticFilterContext';

export default function StatisticLayout() {
  return (
    <StatisticFilterProvider>
      <Outlet />
    </StatisticFilterProvider>
  );
}
