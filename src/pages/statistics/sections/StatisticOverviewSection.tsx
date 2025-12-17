import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function StatisticOverviewSection() {
  const { t } = useTranslation();

  const mockData = [
    {
      label: t('statistics.overview.totalIncome'),
      value: '45,230',
      change: '+12.5%',
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: t('statistics.overview.totalExpense'),
      value: '28,450',
      change: '-8.3%',
      icon: TrendingDown,
      color: 'text-error',
      bgColor: 'bg-error/10',
    },
    {
      label: t('statistics.overview.balance'),
      value: '16,780',
      change: '+18.2%',
      icon: Wallet,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3">
      {mockData.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="bg-base-200 rounded-lg md:rounded-xl p-2 md:p-4 space-y-2">
            <div className="flex items-center justify-between gap-1">
              <p className="text-xs text-base-content/60 line-clamp-1">{item.label}</p>
              <div className={`${item.bgColor} p-1.5 md:p-2 rounded-lg shrink-0`}>
                <Icon
                  className="w-3 h-3 md:w-4 md:h-4"
                  style={{ color: `hsl(var(--${item.color.split('-')[1]})/1)` }}
                />
              </div>
            </div>

            <div>
              <p className="text-base md:text-xl font-bold text-base-content">{item.value}</p>
              <p className={`text-xs font-semibold ${item.color}`}>{item.change}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
