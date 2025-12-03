import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Route, Routes } from 'react-router';
import { ToastContainer } from 'react-toastify';

import { appConfig } from './common/appConfig';
import { DayPickerProvider } from './context/DayPickerContext';
import { EmojiPickerProvider } from './context/EmojiPickerContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { MonthPickerProvider } from './context/MonthPickerContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import ExpensePage from './pages/expenses/ExpensePage';
import NotePage from './pages/notes/NotePage';
import SettingPage from './pages/settings/SettingPage';
import StatisticPage from './pages/statistics/StatisticPage';
import { ROUTES } from './shared/constants/routes.const';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <DayPickerProvider>
        <MonthPickerProvider>
          <EmojiPickerProvider>
            <ExpenseProvider>
              <ThemeProvider>
                {children}
                <ToastContainer
                  className="toast-container"
                  autoClose={200000}
                  theme={appConfig.theme}
                  pauseOnHover={false}
                  position="top-center"
                  hideProgressBar={true}
                  closeOnClick={true}
                />
              </ThemeProvider>
            </ExpenseProvider>
          </EmojiPickerProvider>
        </MonthPickerProvider>
      </DayPickerProvider>
    </QueryClientProvider>
  );
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.ROOT} element={<MainLayout />}>
          <Route path={ROUTES.EXPENSES} element={<ExpensePage />} />
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
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
