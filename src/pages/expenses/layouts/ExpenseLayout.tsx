import { Outlet } from 'react-router';

import { ExpenseDetailProvider } from '../context/ExpenseDetailContext';
import { ExpenseUpsertProvider } from '../context/ExpenseUpsertContext';

export default function ExpenseLayout() {
  return (
    <ExpenseUpsertProvider>
      <ExpenseDetailProvider>
        <Outlet />
      </ExpenseDetailProvider>
    </ExpenseUpsertProvider>
  );
}
