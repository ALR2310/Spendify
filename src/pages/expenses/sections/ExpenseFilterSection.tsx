import dayjs from 'dayjs';
import { CalendarDaysIcon, ChevronLeft, ChevronRight, Funnel, ListRestart } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeEnum } from '@/common/enums/appconfig.enum';
import Drawer, { DrawerRef } from '@/components/Drawer';
import Skeleton from '@/components/Skeleton';
import { ExpenseTypeEnum } from '@/database/types/tables/expenses';
import { useCategoryListQuery } from '@/hooks/apis/category.hook';
import { useExpenseFilterContext } from '@/hooks/app/useExpense';
import { useThemeContext } from '@/hooks/app/useTheme';
import { isValidMonthRange } from '@/utils/expense.utils';
import { getMonthLabel } from '@/utils/general.utils';

function ExpenseFilterDrawer({ ref }: { ref: React.RefObject<DrawerRef> }) {
  const { t } = useTranslation();

  const { data: categories, isLoading: isCategoryLoading } = useCategoryListQuery();

  const filterContext = useExpenseFilterContext();

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

      {/* to-from filters */}
      <div className="flex items-center justify-between gap-4">
        <label className="floating-label">
          <span>{t('expenses.form.dayFrom')}</span>
          <label className="input input-lg">
            <CalendarDaysIcon size={20} />
            <input
              type="search"
              className="grow"
              placeholder={t('expenses.form.dayFrom')}
              readOnly
              value={filterContext.startDate?.toLocaleDateString() ?? ''}
              onClick={filterContext.openStartDatePicker}
            />
          </label>
        </label>

        <label className="floating-label">
          <span>{t('expenses.form.dayTo')}</span>
          <label className="input input-lg">
            <CalendarDaysIcon size={20} />
            <input
              type="search"
              className="grow"
              placeholder={t('expenses.form.dayTo')}
              readOnly
              value={filterContext.endDate?.toLocaleDateString() ?? ''}
              onClick={filterContext.openEndDatePicker}
            />
          </label>
        </label>
      </div>

      {/* type and sort filters */}
      <div className="grid grid-cols-3 items-center gap-y-4">
        <label className="label text-lg">{t('expenses.form.type')}</label>
        <select
          className="select select-lg col-span-2 capitalize"
          value={filterContext.type ?? ''}
          onChange={(e) => filterContext.setType(e.target.value ? (e.target.value as ExpenseTypeEnum) : undefined)}
        >
          <option value="">{t('expenses.filter.all')}</option>
          {Object.values(ExpenseTypeEnum).map((type) => (
            <option key={type} value={type}>
              {t(`expenses.filter.${type.toLowerCase()}`)}
            </option>
          ))}
        </select>

        <label className="label text-lg">{t('expenses.form.sortBy')}</label>
        <div className="join col-span-2">
          <select
            className="select select-lg join-item"
            value={filterContext.sortField}
            onChange={(e) => filterContext.setSortField(e.target.value)}
          >
            <option value="expenses.date">{t('expenses.form.date')}</option>
            <option value="expenses.amount">{t('expenses.form.amount')}</option>
            <option value="categories.name">{t('expenses.form.name')}</option>
          </select>
          <select
            className="select select-lg join-item"
            value={filterContext.sortOrder}
            onChange={(e) => filterContext.setSortOrder(e.target.value as 'asc' | 'desc')}
          >
            <option value="desc">{t('expenses.form.desc')}</option>
            <option value="asc">{t('expenses.form.asc')}</option>
          </select>
        </div>
      </div>

      {/* category filter */}
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
                  filterContext.categoryId === category.id ? 'btn-soft btn-success' : 'btn-soft'
                }`}
                onClick={() => filterContext.setCategoryId(category.id)}
              >
                <span>{category.icon}</span>
                <span className="text-xs line-clamp-1">{category.name}</span>
              </button>
            ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button className="btn btn-ghost rounded-xl flex-1/3" onClick={() => ref.current.close()}>
          {t('expenses.form.close')}
        </button>
        <button className="btn btn-soft rounded-xl flex-2/3" onClick={filterContext.resetFilters}>
          <ListRestart />
          {t('expenses.form.reset')}
        </button>
      </div>
    </Drawer>
  );
}

export default function ExpenseFilterSection() {
  const { resolvedTheme } = useThemeContext();
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const drawerRef = useRef<DrawerRef>(null!);

  const { startDate, endDate, goToNextMonth, goToPrevMonth, openMonthPicker } = useExpenseFilterContext();

  const monthDisplayText = useMemo(() => {
    if (!isValidMonthRange(startDate, endDate)) {
      return t('expenses.form.custom');
    }

    const start = dayjs(startDate);
    const now = dayjs();

    if (start.isSame(now, 'month')) {
      return t('expenses.form.thisMonth');
    }

    return getMonthLabel(start.month(), locale);
  }, [startDate, endDate, locale, t]);

  return (
    <div
      className={`flex flex-col px-4 pb-2 border-b border-base-content/20 sticky top-0 mb-0 z-10 ${resolvedTheme === ThemeEnum.DARK ? 'bg-neutral' : 'bg-white'}`}
    >
      <div className="relative flex items-center justify-center">
        <div className="join w-[65vw]">
          <button className="btn btn-ghost join-item" onClick={goToPrevMonth}>
            <ChevronLeft size={20} />
          </button>

          <button className="btn btn-ghost join-item flex-1" onClick={openMonthPicker}>
            {monthDisplayText}
          </button>

          <button className="btn btn-ghost join-item" onClick={goToNextMonth}>
            <ChevronRight size={20} />
          </button>
        </div>

        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-0 top-1/2 -translate-y-1/2"
          onClick={() => drawerRef.current.openDrawer()}
        >
          <Funnel size={16} />
        </button>
      </div>

      <ExpenseFilterDrawer ref={drawerRef} />
    </div>
  );
}
