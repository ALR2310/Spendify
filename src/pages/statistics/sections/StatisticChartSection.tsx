import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { COLORS } from '@/common/constants/colorClasses';
import { useStatisticOverview } from '@/hooks/apis/statistic.hook';
import { useStatisticFilterContext } from '@/hooks/app/useStatistic';

export default function StatisticChartSection() {
  const { t } = useTranslation();

  const { timeUnit, startDate, endDate } = useStatisticFilterContext();

  const { data } = useStatisticOverview({
    timeUnit,
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
  });

  // Memoize theme colors to reduce re-renders
  const themeStyles = useMemo(
    () => ({
      textColor: 'var(--color-base-content)',
      gridColor: 'color-mix(in oklab, var(--color-base-content) 20%, transparent)',
      tooltipBg: 'color-mix(in oklab, var(--color-base-300) 80%, transparent)',
      tooltipBorder: 'var(--color-base-300)',
    }),
    [],
  );

  // Memoize tooltip styles
  const tooltipContentStyle = useMemo(
    () => ({
      backgroundColor: themeStyles.tooltipBg,
      border: `1px solid ${themeStyles.tooltipBorder}`,
      borderRadius: '6px',
      color: themeStyles.textColor,
      fontSize: '12px',
    }),
    [themeStyles],
  );

  const tooltipLabelStyle = useMemo(() => ({ color: themeStyles.textColor }), [themeStyles.textColor]);

  return (
    <div className="space-y-4">
      {/* Pie Chart */}
      <div className="bg-base-200 rounded-lg p-2">
        <h3 className="font-semibold text-base-content mb-2 text-sm px-2">
          {t('statistics.chart.categoryDistribution')}
        </h3>

        <ResponsiveContainer width="100%" height={288}>
          <PieChart>
            <Pie
              data={data?.categoryDistribution}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={110}
              paddingAngle={5}
              dataKey="percentage"
              label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
            >
              {data?.categoryDistribution.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="outline-none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${Number(value).toFixed(1)}%`}
              contentStyle={tooltipContentStyle}
              itemStyle={{ color: themeStyles.textColor }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-base-200 rounded-lg p-2">
        <h3 className="font-semibold text-base-content mb-2 text-sm px-2">
          {t('statistics.chart.incomeVsExpense')}
        </h3>

        <ResponsiveContainer width="100%" height={288} debounce={300}>
          <BarChart data={data?.cashFlow}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeStyles.gridColor} vertical={false} />
            <XAxis
              dataKey="date"
              stroke={themeStyles.textColor}
              tick={{ fontSize: 11 }}
              interval={'preserveStartEnd'}
            />
            <YAxis stroke={themeStyles.textColor} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} cursor={false} />
            <Legend wrapperStyle={{ color: themeStyles.textColor }} />
            <Bar
              dataKey="income"
              fill="#10b981"
              name={t('statistics.chart.income')}
              radius={[6, 6, 0, 0]}
              isAnimationActive={false}
            />
            <Bar
              dataKey="expense"
              fill="#f87171"
              name={t('statistics.chart.expense')}
              radius={[6, 6, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart */}
      <div className="bg-base-200 rounded-lg p-2">
        <h3 className="font-semibold text-base-content mb-2 text-sm px-2">{t('statistics.chart.balanceTrend')}</h3>

        <ResponsiveContainer width="100%" height={288} debounce={300}>
          <LineChart data={data?.cashFlow}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeStyles.gridColor} vertical={false} />
            <XAxis
              dataKey="date"
              stroke={themeStyles.textColor}
              tick={{ fontSize: 11 }}
              interval={'preserveStartEnd'}
            />
            <YAxis stroke={themeStyles.textColor} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} cursor={false} />
            <Legend wrapperStyle={{ color: themeStyles.textColor }} />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="var(--color-secondary)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
              name={t('statistics.chart.balance')}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="var(--color-success)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
              name={t('statistics.chart.income')}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="var(--color-error)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
              name={t('statistics.chart.expense')}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
