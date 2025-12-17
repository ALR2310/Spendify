import EChartsReact from 'echarts-for-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeEnum } from '@/common/enums/appconfig.enum';
import { useThemeContext } from '@/hooks/app/useTheme';

export default function StatisticChartSection() {
  const { t } = useTranslation();
  const { resolvedTheme } = useThemeContext();

  const chartData = useMemo(
    () => [
      { month: 'Jan', income: 4000, expense: 2400 },
      { month: 'Feb', income: 3000, expense: 1398 },
      { month: 'Mar', income: 2000, expense: 9800 },
      { month: 'Apr', income: 2780, expense: 3908 },
      { month: 'May', income: 1890, expense: 4800 },
      { month: 'Jun', income: 2390, expense: 3800 },
    ],
    [],
  );

  const isDark = resolvedTheme === ThemeEnum.DARK;

  // Bar Chart Options
  const barChartOption = useMemo(
    () => ({
      color: ['#10b981', '#f87171'], // success, error
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        textStyle: { color: isDark ? '#fff' : '#000' },
      },
      grid: {
        left: '3%',
        right: '3%',
        top: '3%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: chartData.map((d) => d.month),
        axisLabel: { color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' },
        axisLine: { lineStyle: { color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' },
        axisLine: { lineStyle: { color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' } },
        splitLine: { lineStyle: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' } },
      },
      series: [
        {
          name: t('statistics.chart.income'),
          data: chartData.map((d) => d.income),
          type: 'bar',
          itemStyle: { borderRadius: [8, 8, 0, 0] },
        },
        {
          name: t('statistics.chart.expense'),
          data: chartData.map((d) => d.expense),
          type: 'bar',
          itemStyle: { borderRadius: [8, 8, 0, 0] },
        },
      ],
      legend: {
        top: 'bottom',
        textStyle: { color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' },
      },
    }),
    [isDark, t, chartData],
  );

  // Line Chart Options
  const lineChartOption = useMemo(
    () => ({
      color: ['#10b981', '#f87171'],
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        textStyle: { color: isDark ? '#fff' : '#000' },
      },
      grid: {
        left: '3%',
        right: '3%',
        top: '3%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: chartData.map((d) => d.month),
        axisLabel: { color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' },
        axisLine: { lineStyle: { color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' },
        axisLine: { lineStyle: { color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' } },
        splitLine: { lineStyle: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' } },
      },
      series: [
        {
          name: t('statistics.chart.income'),
          data: chartData.map((d) => d.income),
          type: 'line',
          smooth: true,
          symbolSize: 6,
          lineStyle: { width: 2 },
        },
        {
          name: t('statistics.chart.expense'),
          data: chartData.map((d) => d.expense),
          type: 'line',
          smooth: true,
          symbolSize: 6,
          lineStyle: { width: 2 },
        },
      ],
      legend: {
        top: 'bottom',
        textStyle: { color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' },
      },
    }),
    [isDark, t, chartData],
  );

  return (
    <div className="space-y-4">
      {/* Bar Chart */}
      <div className="bg-base-200 rounded-lg md:rounded-xl p-2 md:p-4">
        <h3 className="font-semibold text-base-content mb-2 text-sm md:text-base px-2 md:px-0">
          {t('statistics.chart.incomeVsExpense')}
        </h3>
        <div className="w-full h-72 md:h-80">
          <EChartsReact option={barChartOption} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-base-200 rounded-lg md:rounded-xl p-2 md:p-4">
        <h3 className="font-semibold text-base-content mb-2 text-sm md:text-base px-2 md:px-0">
          {t('statistics.chart.balanceTrend')}
        </h3>
        <div className="w-full h-72 md:h-80">
          <EChartsReact option={lineChartOption} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
    </div>
  );
}
