import { Outlet } from 'react-router';

import { ExpenseUpsertProvider } from '../context/ExpenseUpsertContext';

export default function ExpenseLayout() {
  return (
    <ExpenseUpsertProvider>
      <Outlet />
    </ExpenseUpsertProvider>
  );
}
