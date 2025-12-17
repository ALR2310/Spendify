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

export default function StatisticChartSection() {
  const { t } = useTranslation();

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

  // Memoize chart margin to prevent object recreation
  const chartMargin = useMemo(() => ({ top: 10, right: 20, left: -20, bottom: 0 }), []);

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
      <div className="bg-base-200 rounded-lg md:rounded-xl p-2 md:p-4">
        <h3 className="font-semibold text-base-content mb-2 text-sm md:text-base px-2 md:px-0">
          {t('statistics.chart.categoryDistribution')}
        </h3>

        <ResponsiveContainer width="100%" height={288}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={110}
              paddingAngle={5}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}%`}
            >
              {categoryData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="outline-none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${value}%`}
              contentStyle={tooltipContentStyle}
              itemStyle={{ color: themeStyles.textColor }}
            />
            <Legend wrapperStyle={{ color: themeStyles.textColor }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-base-200 rounded-lg md:rounded-xl p-2 md:p-4">
        <h3 className="font-semibold text-base-content mb-2 text-sm md:text-base px-2 md:px-0">
          {t('statistics.chart.incomeVsExpense')}
        </h3>

        <ResponsiveContainer width="100%" height={288} debounce={300}>
          <BarChart data={chartData} margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeStyles.gridColor} vertical={false} />
            <XAxis dataKey="month" stroke={themeStyles.textColor} tick={{ fontSize: 11 }} interval={0} />
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
      <div className="bg-base-200 rounded-lg md:rounded-xl p-2 md:p-4">
        <h3 className="font-semibold text-base-content mb-2 text-sm md:text-base px-2 md:px-0">
          {t('statistics.chart.balanceTrend')}
        </h3>

        <ResponsiveContainer width="100%" height={288} debounce={300}>
          <LineChart data={chartData} margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeStyles.gridColor} vertical={false} />
            <XAxis dataKey="month" stroke={themeStyles.textColor} tick={{ fontSize: 11 }} interval={0} />
            <YAxis stroke={themeStyles.textColor} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} cursor={false} />
            <Legend wrapperStyle={{ color: themeStyles.textColor }} />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
              name={t('statistics.chart.income')}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#f87171"
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
