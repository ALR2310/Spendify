import StatisticCategorySection from './sections/StatisticCategorySection';
import StatisticChartSection from './sections/StatisticChartSection';
import StatisticFilterSection from './sections/StatisticFilterSection';
import StatisticOverviewSection from './sections/StatisticOverviewSection';

export default function StatisticPage() {
  return (
    <div className="pt-0 space-y-4 pb-20">
      <StatisticFilterSection />
      <div className="p-3 space-y-4">
        <StatisticOverviewSection />
        <StatisticChartSection />
        <StatisticCategorySection />
      </div>
    </div>
  );
}
