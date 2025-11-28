import { BrowserRouter, Route, Routes } from 'react-router';
import { ToastContainer } from 'react-toastify';

import MainLayout from './layouts/MainLayout';
import ExpensesPage from './pages/expenses/ExpensesPage';
import NotesPage from './pages/notes/NotesPage';
import SettingsPage from './pages/settings/SettingsPage';
import StatisticsPage from './pages/statistics/StatisticsPage';
import { ROUTES } from './shared/constants/routes.const';

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <ToastContainer
        className="toast-container"
        autoClose={200000}
        theme="dark"
        pauseOnHover={false}
        position="top-center"
        hideProgressBar={true}
        closeOnClick={true}
      />
    </>
  );
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.ROOT} element={<MainLayout />}>
          <Route path={ROUTES.EXPENSES} element={<ExpensesPage />} />
          <Route path={ROUTES.STATISTICS} element={<StatisticsPage />} />
          <Route path={ROUTES.NOTES} element={<NotesPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default function AppContainer() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
