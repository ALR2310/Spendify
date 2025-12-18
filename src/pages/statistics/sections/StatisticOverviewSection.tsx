import { Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { StatisticOverview } from '@/common/types/statistic.type';
import { useStatisticOverview } from '@/hooks/apis/statistic.hook';
import { useStatisticFilterContext } from '@/hooks/app/useStatistic';
import { formatCurrencyWithCompact } from '@/utils/general.utils';
import { resolveChangeUI } from '@/utils/statistic.utils';

function SummaryStats({ data }: { data?: StatisticOverview['summary'] }) {
  const { t } = useTranslation();

  if (!data) return null;

  const listData = [
    {
      type: 'income' as const,
      label: t('statistics.summary.totalIncome'),
      value: formatCurrencyWithCompact(data.income.total, 10_000_000),
      ...resolveChangeUI(data.income.change, 'income'),
    },
    {
      type: 'expense' as const,
      label: t('statistics.summary.totalExpense'),
      value: formatCurrencyWithCompact(data.expense.total, 10_000_000),
      ...resolveChangeUI(data.expense.change, 'expense'),
    },
    {
      type: 'balance' as const,
      label: t('statistics.summary.balance'),
      value: formatCurrencyWithCompact(data.balance.total, 10_000_000),
      ...resolveChangeUI(data.balance.change, 'balance'),
    },
  ];

  return listData.map((item, index) => {
    const Icon = item.Icon ?? Wallet;

    return (
      <div key={index} className="bg-base-200 rounded-lg md:rounded-xl p-2 md:p-4 space-y-2">
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs text-base-content/60 line-clamp-1">{item.label}</p>

          <div className={`${item.bgColor} p-1.5 md:p-2 rounded-lg shrink-0`}>
            <Icon className={`w-3 h-3 md:w-4 md:h-4 ${item.color}`} />
          </div>
        </div>

        <div>
          <p className="text-base font-bold text-base-content">{item.value}</p>

          <p className={`text-xs text-end font-semibold ${item.color}`} title="Compared to previous period">
            {item.text}
          </p>
        </div>
      </div>
    );
  });
}

export default function StatisticOverviewSection() {
  const { t } = useTranslation();

  const { timeUnit, startDate, endDate } = useStatisticFilterContext();

  const { data } = useStatisticOverview({
    timeUnit,
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
  });

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <SummaryStats data={data?.summary} />
      </div>

      {/* Summary Stats */}
      <div className="bg-base-200 rounded-lg md:rounded-xl p-3 md:p-4 space-y-3">
        <h3 className="font-semibold text-base-content text-sm md:text-base">{t('statistics.summary.title')}</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <div className="p-2 md:p-3 bg-base-100 rounded-lg">
            <p className="text-xs text-base-content/60">{t('statistics.summary.avgTransaction')}</p>
            <p className="font-semibold text-sm md:text-base text-base-content">
              {formatCurrencyWithCompact(data?.summary.expense.average ?? 0)}
            </p>
          </div>
          <div className="p-2 md:p-3 bg-base-100 rounded-lg">
            <p className="text-xs text-base-content/60">{t('statistics.summary.totalTransaction')}</p>
            <p className="font-semibold text-sm md:text-base text-base-content">
              {formatCurrencyWithCompact(data?.summary.expense.total ?? 0)}
            </p>
          </div>
          <div className="p-2 md:p-3 bg-base-100 rounded-lg">
            <p className="text-xs text-base-content/60">{t('statistics.summary.maxExpense')}</p>
            <p className="font-semibold text-sm md:text-base text-base-content">
              {formatCurrencyWithCompact(data?.summary.expense.max ?? 0)}
            </p>
          </div>
          <div className="p-2 md:p-3 bg-base-100 rounded-lg">
            <p className="text-xs text-base-content/60">{t('statistics.summary.minExpense')}</p>
            <p className="font-semibold text-sm md:text-base text-success">
              {formatCurrencyWithCompact(data?.summary.expense.min ?? 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
