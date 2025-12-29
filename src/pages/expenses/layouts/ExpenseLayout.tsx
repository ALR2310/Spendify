import { Outlet } from 'react-router';

import { ExpenseDetailProvider } from '../context/ExpenseDetailContext';
import { ExpenseFilterProvider } from '../context/ExpenseFilterContext';
import { RecurringDetailProvider } from '../context/RecurringDetailContext';

export default function ExpenseLayout() {
  return (
    <ExpenseFilterProvider>
      <ExpenseDetailProvider>
        <RecurringDetailProvider>
          <Outlet />
        </RecurringDetailProvider>
      </ExpenseDetailProvider>
    </ExpenseFilterProvider>
  );
}
