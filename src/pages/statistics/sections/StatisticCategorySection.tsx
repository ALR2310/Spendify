import EChartsReact from 'echarts-for-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeEnum } from '@/common/enums/appconfig.enum';
import { useThemeContext } from '@/hooks/app/useTheme';

export default function StatisticCategorySection() {
  const { t } = useTranslation();
  const { resolvedTheme } = useThemeContext();

  const categoryData = useMemo(
    () => [
      { name: t('statistics.category.food'), value: 35 },
      { name: t('statistics.category.transport'), value: 25 },
      { name: t('statistics.category.entertainment'), value: 20 },
      { name: t('statistics.category.utilities'), value: 20 },
    ],
    [t],
  );

  const COLORS = useMemo(() => ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'], []);

  const isDark = resolvedTheme === ThemeEnum.DARK;

  // Pie Chart Options
  const pieChartOption = useMemo(
    () => ({
      color: COLORS,
      tooltip: {
        trigger: 'item',
        backgroundColor: isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        textStyle: { color: isDark ? '#fff' : '#000' },
        formatter: '{b}: {c} ({d}%)',
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          data: categoryData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
            fontSize: 12,
          },
        },
      ],
      legend: {
        top: 'bottom',
        textStyle: { color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' },
        itemGap: 10,
      },
    }),
    [isDark, categoryData, COLORS],
  );

  return (
    <div className="space-y-4">
      {/* Pie Chart */}
      <div className="bg-base-200 rounded-lg md:rounded-xl p-2 md:p-4">
        <h3 className="font-semibold text-base-content mb-2 text-sm md:text-base px-2 md:px-0">
          {t('statistics.chart.categoryDistribution')}
        </h3>
        <div className="w-full h-72 md:h-80">
          <EChartsReact option={pieChartOption} style={{ height: '100%', width: '100%' }} />
        </div>
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
