import dayjs from 'dayjs';
import { CalendarDaysIcon, ChevronLeft, ChevronRight, Funnel, ListRestart } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeEnum } from '@/common/enums/appconfig.enum';
import { StatisticTimeUnitEnum } from '@/common/types/statistic.type';
import Drawer, { DrawerRef } from '@/components/Drawer';
import Skeleton from '@/components/Skeleton';
import { useCategoryListQuery } from '@/hooks/apis/category.hook';
import { useStatisticFilterContext } from '@/hooks/app/useStatistic';
import { useThemeContext } from '@/hooks/app/useTheme';
import { formatDateRange } from '@/utils/statistic.utils';

function StatisticFilterDrawer({ ref }: { ref: React.RefObject<DrawerRef> }) {
  const { t } = useTranslation();

  const { data: categories, isLoading: isCategoryLoading } = useCategoryListQuery();

  const filterContext = useStatisticFilterContext();

  const handlePredefinedDateRange = (days: number) => {
    const today = dayjs();
    const startDate = today.subtract(days, 'day').startOf('day').toDate();
    const endDate = today.endOf('day').toDate();
    filterContext.setStartDate(startDate);
    filterContext.setEndDate(endDate);
  };

  return (
    <Drawer
      ref={ref}
      position="bottom"
      classNames={{
        drawer: 'min-h-[300px] p-4 space-y-4 z-99!',
        overlay: 'z-99!',
      }}
    >
      <div className="relative flex items-center justify-center mb-2">
        <h3 className="font-semibold text-lg">{t('expenses.form.filters')}</h3>
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2" onClick={() => ref.current.close()}>
          ✕
        </button>
      </div>

      {/* Date Range Filters */}
      <div className="flex items-center justify-between gap-4">
        <label className="floating-label">
          <span>{t('statistics.filter.startDate')}</span>
          <label className="input input-lg">
            <CalendarDaysIcon size={20} className="text-base-content/70" />
            <input
              type="search"
              className="grow"
              placeholder={t('statistics.filter.startDate')}
              readOnly
              value={filterContext.startDate?.toLocaleDateString() ?? ''}
              onClick={filterContext.openStartDatePicker}
            />
          </label>
        </label>

        <label className="floating-label">
          <span>{t('statistics.filter.endDate')}</span>
          <label className="input input-lg">
            <CalendarDaysIcon size={20} className="text-base-content/70" />
            <input
              type="search"
              className="grow"
              placeholder={t('statistics.filter.endDate')}
              readOnly
              value={filterContext.endDate?.toLocaleDateString() ?? ''}
              onClick={filterContext.openEndDatePicker}
            />
          </label>
        </label>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <button className="btn btn-sm btn-soft" onClick={() => handlePredefinedDateRange(1)}>
          {t('statistics.filter.oneDay')}
        </button>
        <button className="btn btn-sm btn-soft" onClick={() => handlePredefinedDateRange(7)}>
          {t('statistics.filter.oneWeek')}
        </button>
        <button className="btn btn-sm btn-soft" onClick={() => handlePredefinedDateRange(30)}>
          {t('statistics.filter.oneMonth')}
        </button>
        <button className="btn btn-sm btn-soft" onClick={() => handlePredefinedDateRange(180)}>
          {t('statistics.filter.sixMonths')}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 items-center">
        <label className="label text-lg">Time Unit:</label>
        <select
          className="select select-lg capitalize col-span-2"
          value={filterContext.timeUnit}
          onChange={(e) => filterContext.setTimeUnit(e.target.value as StatisticTimeUnitEnum)}
        >
          {Object.entries(StatisticTimeUnitEnum).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      <div className="flex flex-col">
        <label className="label text-lg">{t('expenses.form.category')}</label>
        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
          {isCategoryLoading && <Skeleton className="w-full h-12" />}
          {!isCategoryLoading && categories?.length === 0 && (
            <p className="text-center col-span-3">No categories found</p>
          )}
          {!isCategoryLoading &&
            categories?.map((category) => (
              <button
                key={category.id}
                className={`btn btn-lg flex flex-col items-center gap-0 ${
                  filterContext.categoryIds.includes(category.id) ? 'btn-soft btn-success' : 'btn-soft'
                }`}
                onClick={() => {
                  const isSelected = filterContext.categoryIds.includes(category.id);
                  if (isSelected) {
                    filterContext.setCategoryIds(filterContext.categoryIds.filter((id) => id !== category.id));
                  } else {
                    filterContext.setCategoryIds([...filterContext.categoryIds, category.id]);
                  }
                }}
              >
                <span>{category.icon}</span>
                <span className="text-xs line-clamp-1">{category.name}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-2">
        <button className="btn btn-ghost rounded-xl flex-1/3" onClick={() => ref.current.close()}>
          {t('statistics.form.close')}
        </button>
        <button className="btn btn-soft rounded-xl flex-2/3" onClick={filterContext.resetFilters}>
          <ListRestart />
          {t('statistics.form.reset')}
        </button>
      </div>
    </Drawer>
  );
}

export default function StatisticFilterSection() {
  const { resolvedTheme } = useThemeContext();
  const { t } = useTranslation();
  const drawerRef = useRef<DrawerRef>(null!);

  const { startDate, endDate, goToNextMonth, goToPrevMonth } = useStatisticFilterContext();

  return (
    <div
      className={`flex flex-col px-4 pb-2 border-b border-base-content/20 sticky top-0 mb-0 z-10 ${resolvedTheme === ThemeEnum.DARK ? 'bg-neutral' : 'bg-white'}`}
    >
      <div className="relative flex items-center justify-center">
        <div className="join w-[65vw]">
          <button className="btn btn-ghost join-item" onClick={goToPrevMonth}>
            <ChevronLeft size={20} />
          </button>

          <div className="text-center flex-1">
            <p className="font-semibold text-sm text-base-content">{t('statistics.filter.period')}</p>
            <p className="text-xs text-base-content/60">{formatDateRange(startDate, endDate)}</p>
          </div>

          <button className="btn btn-ghost join-item" onClick={goToNextMonth}>
            <ChevronRight size={20} />
          </button>
        </div>

        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-0 top-1/2 -translate-y-1/2"
          onClick={() => drawerRef.current?.openDrawer()}
        >
          <Funnel size={18} />
        </button>
      </div>

      <StatisticFilterDrawer ref={drawerRef} />
    </div>
  );
}
