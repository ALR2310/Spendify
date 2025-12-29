import dayjs from 'dayjs';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { useExpenseOverview } from '@/hooks/apis/expense.hook';
import { useExpenseFilterContext } from '@/hooks/app/useExpense';
import { formatCurrencyWithCompact } from '@/utils/general.utils';

const progressColors = ['progress-primary', 'progress-accent', 'progress-secondary'];

export default function ExpenseStatSection() {
  const { t } = useTranslation();

  const { startDate, endDate } = useExpenseFilterContext();

  const { data: expenseOverview } = useExpenseOverview({
    startDate: startDate && dayjs(startDate).startOf('month').startOf('day').toISOString(),
    endDate: endDate && dayjs(endDate).endOf('month').endOf('day').toISOString(),
  });

  const { totalRevenue = 0, totalExpenses = 0, difference = 0 } = expenseOverview?.summary || {};
  const isNegative = difference < 0;

  return (
    <div className="flex flex-col gap-4 p-4 pb-0">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-base-content/60 text-xs">{t('expenses.stat.totalRevenue')}</p>
          <p className="text-lg text-primary font-semibold">{formatCurrencyWithCompact(totalRevenue)}</p>
        </div>

        <div className="text-center">
          <p className="text-base-content/60 text-xs">{t('expenses.stat.totalExpenses')}</p>
          <p className="text-lg text-accent font-semibold">{formatCurrencyWithCompact(totalExpenses)}</p>
        </div>

        <div className="text-center">
          <p className="text-base-content/60 text-xs">{t('expenses.stat.balance')}</p>
          <p className={`text-lg font-semibold ${isNegative ? 'text-error' : 'text-success'}`}>
            {formatCurrencyWithCompact(difference)}
          </p>
        </div>
      </div>

      {(expenseOverview?.categoryDistribution?.length ?? 0) > 0 && (
        <div className="flex flex-col gap-4">
          <p className="font-semibold text-lg">{t('expenses.stat.expenseDistribution')}</p>

          <div className="grid grid-cols-3 items-center gap-y-2">
            {expenseOverview?.categoryDistribution.map((category, index) => (
              <Fragment key={category.id}>
                <label className="text-sm font-semibold">{category.name}</label>
                <div className="col-span-2 relative flex items-center">
                  <progress
                    className={`progress w-full ${progressColors[index % progressColors.length]}`}
                    value={category.percentage}
                    max={100}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-base-content">
                    {category.percentage}%
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
