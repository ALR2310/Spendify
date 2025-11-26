import { ToastContainer } from 'react-toastify';
import { App } from 'konsta/react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { ROUTES } from './shared/constants/routes.const';
import TabsLayout from './layouts/TabsLayout';
import ExpensesPage from './pages/expenses/ExpensesPage';
import SettingsPage from './pages/settings/SettingsPage';
import StatisticsPage from './pages/statistics/StatisticsPage';

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <ToastContainer autoClose={2000} theme="dark" pauseOnHover={false} />
    </>
  );
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.ROOT} element={<TabsLayout />}>
          <Route path={ROUTES.EXPENSES} element={<ExpensesPage />} />
          <Route path={ROUTES.STATISTICS} element={<StatisticsPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default function AppContainer() {
  return (
    <App theme="ios" dark={true} safeAreas>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </App>
  );
}
