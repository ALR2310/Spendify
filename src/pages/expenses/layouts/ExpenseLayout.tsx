import { Outlet } from 'react-router';

import { ExpenseDetailProvider } from '../context/ExpenseDetailContext';
import { ExpenseFilterProvider } from '../context/ExpenseFilterContext';

export default function ExpenseLayout() {
  return (
    <ExpenseFilterProvider>
      <ExpenseDetailProvider>
        <Outlet />
      </ExpenseDetailProvider>
    </ExpenseFilterProvider>
  );
}
