import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ExpenseTypeEnum } from '@/common/database/types/tables/expenses';
import { useExpenseListInfinite } from '@/hooks/apis/expense.hook';
import { useExpenseDetailContext, useExpenseUpsertContext } from '@/hooks/app/useExpense';
import { useThemeContext } from '@/hooks/app/useTheme';
import { ThemeEnum } from '@/shared/enums/appconfig.enum';
import { Expense } from '@/shared/types/expense.type';
import { groupExpenseByDate } from '@/utils/expense.utils';
import { formatCurrency } from '@/utils/general.utils';

const NotFoundCard = () => {
  const { t } = useTranslation();
  const { openModal } = useExpenseUpsertContext();

  return (
    <div className="flex flex-col p-6 bg-base-200 rounded-xl text-center">
      <p>{t('expenses.list.notFound')}</p>
      <p>
        {t('expenses.list.notFoundClick')}{' '}
        <a className="link link-success" onClick={() => openModal()}>
          {t('expenses.list.notFoundHere')}
        </a>{' '}
        {t('expenses.list.notFoundAdd')}
      </p>
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

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useExpenseListInfinite({});

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
        {dates.length === 0 && <NotFoundCard />}
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
