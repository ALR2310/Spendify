import dayjs from 'dayjs';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeEnum } from '@/common/enums/appconfig.enum';
import { Expense } from '@/common/types/expense.type';
import { ExpenseTypeEnum } from '@/database/types/tables/expenses';
import { useExpenseListInfinite } from '@/hooks/apis/expense.hook';
import { useRecurringListQuery } from '@/hooks/apis/recurring.hook';
import {
  useExpenseDetailContext,
  useExpenseFilterContext,
  useExpenseFormContext,
  useRecurringDetailContext,
} from '@/hooks/app/useExpense';
import { useThemeContext } from '@/hooks/app/useTheme';
import { groupExpenseByDate, isValidMonthRange } from '@/utils/expense.utils';
import { formatCurrency } from '@/utils/general.utils';

const NotFoundCard = ({
  hasDateFilter,
  isValidMonth,
  type = 'expenses',
}: {
  hasDateFilter: boolean;
  isValidMonth: boolean;
  type?: 'expenses' | 'recurring';
}) => {
  const { t } = useTranslation();
  const { openForm } = useExpenseFormContext();

  let notFoundMessage = '';
  if (type === 'recurring') {
    notFoundMessage = t('expenses.list.recurringNotFound') || 'No recurring expenses found';
  } else {
    notFoundMessage = t('expenses.list.notFound');
    if (isValidMonth) {
      notFoundMessage = t('expenses.list.notFoundMonthFilter');
    } else if (hasDateFilter) {
      notFoundMessage = t('expenses.list.notFoundDateFilter');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6 bg-base-200 rounded-xl text-center">
      <div className="text-5xl opacity-40">{type === 'recurring' ? '🔄' : '📭'}</div>
      <div className="flex flex-col gap-2">
        <p className="text-lg font-semibold">{notFoundMessage}</p>
        {!hasDateFilter && type === 'expenses' && (
          <p className="text-sm opacity-70">
            {t('expenses.list.notFoundClick')}{' '}
            <a className="link link-success font-semibold" onClick={() => openForm()}>
              {t('expenses.list.notFoundHere')}
            </a>{' '}
            {t('expenses.list.notFoundAdd')}
          </p>
        )}
      </div>
    </div>
  );
};

const ExpenseCard = memo(({ data, onClick }: { data?: Expense; onClick?: () => void }) => {
  return (
    <div
      className={`card shadow-sm bg-base-200 p-3 rounded-xl flex flex-row items-center gap-3 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="text-3xl">{data?.categoryIcon}</div>
      <div className="flex flex-col flex-1">
        <span className="font-semibold">{data?.categoryName}</span>
        <span className="text-sm opacity-60">{data?.note}</span>
      </div>
      <div
        className={`${data?.type === ExpenseTypeEnum.Income ? 'text-success' : 'text-error'}  font-semibold whitespace-nowrap`}
      >
        {formatCurrency(data?.amount ?? 0)}
      </div>
    </div>
  );
});

const RecurringCard = memo(({ data, onClick }: { data?: any; onClick?: () => void }) => {
  return (
    <div
      className={`card shadow-sm bg-base-200 p-3 rounded-xl flex flex-row items-center gap-3 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="text-3xl">{data?.categoryIcon || '🔄'}</div>
      <div className="flex flex-col flex-1">
        <span className="font-semibold">{data?.categoryName}</span>
        <span className="text-xs opacity-60">{dayjs(data?.startDate).format('DD/MM/YYYY')}</span>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="font-semibold whitespace-nowrap">{formatCurrency(data?.amount ?? 0)}</div>
        <div className="text-xs opacity-60">{data?.period}</div>
      </div>
    </div>
  );
});

export default function ExpenseListSection() {
  const { t } = useTranslation();
  const { resolvedTheme } = useThemeContext();
  const { showDetail } = useExpenseDetailContext();
  const { showDetail: showRecurringDetail } = useRecurringDetailContext();
  const { buildExpenseListQuery, startDate, endDate } = useExpenseFilterContext();

  const [activeList, setActiveList] = useState<'expenses' | 'recurring'>('expenses');

  const query = useMemo(() => buildExpenseListQuery(), [buildExpenseListQuery]);
  const hasDateFilter = useMemo(() => !!query.startDate, [query]);
  const isValidMonth = useMemo(() => isValidMonthRange(startDate, endDate), [startDate, endDate]);

  const { data: expenses, fetchNextPage, hasNextPage, isFetchingNextPage } = useExpenseListInfinite(query);
  const { data: recurrings } = useRecurringListQuery();

  const items = useMemo(() => expenses?.pages.flatMap((p) => p.data) ?? [], [expenses]);
  const grouped = useMemo(() => groupExpenseByDate(items), [items]);
  const dates = Object.keys(grouped);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (hasNextPage && !isFetchingNextPage && el.scrollTop + el.clientHeight >= el.scrollHeight - 200) {
      fetchNextPage();
    }
  };

  return (
    <div className="flex flex-col gap-3 max-h-[70vh] p-4 mb-0">
      <div className="tabs tabs-border tabs-border-accent justify-between">
        <button
          className={`tab text-lg font-semibold ${activeList === 'expenses' ? 'tab-active' : ''}`}
          onClick={() => setActiveList('expenses')}
        >
          {t('expenses.list.title')}
        </button>
        <button
          className={`tab text-lg font-semibold ${activeList === 'recurring' ? 'tab-active' : ''}`}
          onClick={() => setActiveList('recurring')}
        >
          Recurring List
        </button>
      </div>

      <div className="flex-1 overflow-auto" onScroll={handleScroll}>
        {activeList === 'expenses' ? (
          <>
            {dates.length === 0 && <NotFoundCard hasDateFilter={hasDateFilter} isValidMonth={isValidMonth} />}
            {dates.map((date) => (
              <div key={date} className="space-y-4">
                <div
                  className={`divider sticky top-0 z-10 py-4 m-0 ${resolvedTheme === ThemeEnum.DARK ? 'bg-neutral' : 'bg-white'}`}
                >
                  {date}
                </div>

                {grouped[date].map((exp) => (
                  <ExpenseCard key={exp.id} data={exp} onClick={() => showDetail(exp.id)} />
                ))}
              </div>
            ))}

            {isFetchingNextPage && (
              <div className="text-center py-4 opacity-60">{t('expenses.list.loadingMore')}</div>
            )}
          </>
        ) : (
          <>
            {recurrings && recurrings.length === 0 && (
              <NotFoundCard hasDateFilter={false} isValidMonth={false} type="recurring" />
            )}
            {recurrings && recurrings.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm font-semibold opacity-70 px-2">
                  {t('expenses.list.recurring') || 'Recurring Expenses'}
                </div>
                {recurrings.map((recurring) => (
                  <RecurringCard
                    key={recurring.id}
                    data={recurring}
                    onClick={() => showRecurringDetail(recurring.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
