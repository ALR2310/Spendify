import { useTranslation } from 'react-i18next';

import { formatCurrency } from '@/utils/general.utils';

export default function ExpenseStatSection() {
  const { t } = useTranslation();

  const formatAuto = (amount: number) => {
    const useCompact = Math.abs(amount) >= 100_000_000;
    return formatCurrency(amount, useCompact ? { notation: 'compact' } : {});
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-0">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-base-content/60 text-xs">{t('expenses.stat.totalRevenue')}</p>
          <p className="text-lg text-primary font-semibold">{formatAuto(10000000)}</p>
        </div>

        <div className="text-center">
          <p className="text-base-content/60 text-xs">{t('expenses.stat.totalExpenses')}</p>
          <p className="text-lg text-accent font-semibold">{formatAuto(10000000)}</p>
        </div>

        <div className="text-center">
          <p className="text-base-content/60 text-xs">{t('expenses.stat.difference')}</p>
          <p className="text-lg text-success font-semibold">{formatAuto(10000000)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="font-semibold text-lg">{t('expenses.stat.categories')}</p>

        <div className="grid grid-cols-3 items-center gap-y-2">
          <label className="text-sm">{t('expenses.stat.food')}</label>
          <progress className="progress progress-primary col-span-2" value="80" max="100"></progress>

          <label className="text-sm">{t('expenses.stat.transport')}</label>
          <progress className="progress progress-accent col-span-2" value="50" max="100"></progress>

          <label className="text-sm">{t('expenses.stat.shopping')}</label>
          <progress className="progress progress-secondary col-span-2" value="60" max="100"></progress>
        </div>
      </div>
    </div>
  );
}
