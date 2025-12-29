import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeEnum } from '@/common/enums/appconfig.enum';
import { Expense } from '@/common/types/expense.type';
import { ExpenseTypeEnum } from '@/database/types/tables/expenses';
import { useExpenseListInfinite } from '@/hooks/apis/expense.hook';
import { useExpenseDetailContext, useExpenseFilterContext, useExpenseFormContext } from '@/hooks/app/useExpense';
import { useThemeContext } from '@/hooks/app/useTheme';
import { groupExpenseByDate, isValidMonthRange } from '@/utils/expense.utils';
import { formatCurrency } from '@/utils/general.utils';

const NotFoundCard = ({ hasDateFilter, isValidMonth }: { hasDateFilter: boolean; isValidMonth: boolean }) => {
  const { t } = useTranslation();
  const { openForm } = useExpenseFormContext();

  let notFoundMessage = t('expenses.list.notFound');
  if (isValidMonth) {
    notFoundMessage = t('expenses.list.notFoundMonthFilter');
  } else if (hasDateFilter) {
    notFoundMessage = t('expenses.list.notFoundDateFilter');
  }

  return (
    <div className="flex flex-col p-6 bg-base-200 rounded-xl text-center">
      <p>{notFoundMessage}</p>
      {!hasDateFilter && (
        <p>
          {t('expenses.list.notFoundClick')}{' '}
          <a className="link link-success" onClick={() => openForm()}>
            {t('expenses.list.notFoundHere')}
          </a>{' '}
          {t('expenses.list.notFoundAdd')}
        </p>
      )}
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

export default function ExpenseListSection() {
  const { t } = useTranslation();
  const { resolvedTheme } = useThemeContext();
  const { showDetail } = useExpenseDetailContext();
  const { buildExpenseListQuery, startDate, endDate } = useExpenseFilterContext();

  const query = useMemo(() => buildExpenseListQuery(), [buildExpenseListQuery]);
  const hasDateFilter = useMemo(() => !!query.startDate, [query]);
  const isValidMonth = useMemo(() => isValidMonthRange(startDate, endDate), [startDate, endDate]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useExpenseListInfinite(query);

  const items = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);
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
      <p className="font-semibold text-lg">{t('expenses.list.title')}</p>

      <div className="flex-1 overflow-auto" onScroll={handleScroll}>
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

        {isFetchingNextPage && <div className="text-center py-4 opacity-60">{t('expenses.list.loadingMore')}</div>}
      </div>
    </div>
  );
}
