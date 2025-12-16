import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Route, Routes } from 'react-router';
import { ToastContainer } from 'react-toastify';

import { ROUTES } from './common/constants/routes.const';
import { EmojiPickerProvider } from './context/EmojiPickerContext';
import { ExpenseUpsertProvider } from './context/ExpenseUpsertContext';
import { ThemeProvider } from './context/ThemeContext';
import { ConfirmContainer } from './global/confirm/confirmContainer';
import DatePickerContainer from './global/datepicker/DatePickerContainer';
import MonthPickerContainer from './global/monthpicker/MonthPickerContainer';
import { useThemeContext } from './hooks/app/useTheme';
import MainLayout from './layouts/MainLayout';
import ExpensePage from './pages/expenses/ExpensePage';
import ExpenseLayout from './pages/expenses/layouts/ExpenseLayout';
import NotePage from './pages/notes/NotePage';
import SettingPage from './pages/settings/SettingPage';
import StatisticPage from './pages/statistics/StatisticPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useThemeContext();

  return (
    <QueryClientProvider client={queryClient}>
      <EmojiPickerProvider>
        <ExpenseUpsertProvider>
          {children}
          <DatePickerContainer />
          <MonthPickerContainer />
          <ConfirmContainer />
          <ToastContainer
            className="toast-container"
            autoClose={2000}
            theme={resolvedTheme}
            pauseOnHover={false}
            position="top-center"
            hideProgressBar={true}
            closeOnClick={true}
          />
        </ExpenseUpsertProvider>
      </EmojiPickerProvider>
    </QueryClientProvider>
  );
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.ROOT} element={<MainLayout />}>
          <Route path={ROUTES.EXPENSES} element={<ExpenseLayout />}>
            <Route index element={<ExpensePage />} />
          </Route>
          <Route path={ROUTES.STATISTICS} element={<StatisticPage />} />
          <Route path={ROUTES.NOTES} element={<NotePage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default function AppContainer() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </ThemeProvider>
  );
}
