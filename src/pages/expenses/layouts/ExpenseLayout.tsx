import { Outlet } from 'react-router';

import { ExpenseDetailProvider } from '../context/ExpenseDetailContext';
import { ExpenseFilterProvider } from '../context/ExpenseFilterContext';
import { ExpenseUpsertProvider } from '../context/ExpenseUpsertContext';

export default function ExpenseLayout() {
  return (
    <ExpenseUpsertProvider>
      <ExpenseFilterProvider>
        <ExpenseDetailProvider>
          <Outlet />
        </ExpenseDetailProvider>
      </ExpenseFilterProvider>
    </ExpenseUpsertProvider>
  );
}
