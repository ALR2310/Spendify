import { Outlet } from 'react-router';

import { ExpenseUIProvider } from '../context/ExpenseUIContext';

export default function ExpenseLayout() {
  return (
    <ExpenseUIProvider>
      <Outlet />
    </ExpenseUIProvider>
  );
}
