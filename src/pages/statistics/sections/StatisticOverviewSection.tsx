import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useMemo } from 'react';
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

  const categoryData = useMemo(
    () => [
      { name: t('statistics.category.food'), value: 35 },
      { name: t('statistics.category.transport'), value: 25 },
      { name: t('statistics.category.entertainment'), value: 20 },
      { name: t('statistics.category.utilities'), value: 20 },
    ],
    [t],
  );

  const COLORS = [
    'var(--color-primary)',
    'var(--color-secondary)',
    'var(--color-accent)',
    'var(--color-info)',
    'var(--color-success)',
    'var(--color-warning)',
    'var(--color-error)',
  ];

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
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

      {/* Category List */}
      <div className="bg-base-200 rounded-lg md:rounded-xl p-3 md:p-4 space-y-3">
        <h3 className="font-semibold text-base-content text-sm md:text-base">
          {t('statistics.chart.categoryBreakdown')}
        </h3>

        <div className="space-y-2 md:space-y-3">
          {categoryData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <div
                  className="w-3 h-3 md:w-4 md:h-4 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs md:text-sm text-base-content">{item.name}</span>
              </div>
              <span className="font-semibold text-xs md:text-sm text-base-content">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-base-200 rounded-lg md:rounded-xl p-3 md:p-4 space-y-3">
        <h3 className="font-semibold text-base-content text-sm md:text-base">{t('statistics.summary.title')}</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <div className="p-2 md:p-3 bg-base-100 rounded-lg">
            <p className="text-xs text-base-content/60">{t('statistics.summary.avgTransaction')}</p>
            <p className="font-semibold text-sm md:text-base text-base-content">1,247</p>
          </div>
          <div className="p-2 md:p-3 bg-base-100 rounded-lg">
            <p className="text-xs text-base-content/60">{t('statistics.summary.totalTransaction')}</p>
            <p className="font-semibold text-sm md:text-base text-base-content">48</p>
          </div>
          <div className="p-2 md:p-3 bg-base-100 rounded-lg">
            <p className="text-xs text-base-content/60">{t('statistics.summary.maxExpense')}</p>
            <p className="font-semibold text-sm md:text-base text-base-content">5,234</p>
          </div>
          <div className="p-2 md:p-3 bg-base-100 rounded-lg">
            <p className="text-xs text-base-content/60">{t('statistics.summary.savingRate')}</p>
            <p className="font-semibold text-sm md:text-base text-success">37%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
