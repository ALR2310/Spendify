import { CalendarDaysIcon, ChevronLeft, ChevronRight, Funnel, ListRestart } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeEnum } from '@/common/enums/appconfig.enum';
import Drawer, { DrawerRef } from '@/components/Drawer';
import Skeleton from '@/components/Skeleton';
import { ExpenseTypeEnum } from '@/database/types/tables/expenses';
import { useCategoryListQuery } from '@/hooks/apis/category.hook';
import { useDayPickerContext } from '@/hooks/app/useDayPicker';
import { useExpenseFilterContext } from '@/hooks/app/useExpense';
import { useMonthPickerContext } from '@/hooks/app/useMonthPicker';
import { useThemeContext } from '@/hooks/app/useTheme';
import { getMonthLabel } from '@/utils/general.utils';

function ExpenseFilterDrawer({ ref }: { ref: React.RefObject<DrawerRef> }) {
  const { t } = useTranslation();
  const filterContext = useExpenseFilterContext();
  const { date: dayFromPicker, setDate: setDayFromPicker, open: openDayFromPicker } = useDayPickerContext();
  const { date: dayToPicker, setDate: setDayToPicker, open: openDayToPicker } = useDayPickerContext();
  const { setMonth: setMonthValue } = useMonthPickerContext();

  const { data: categories, isLoading: isCategoryLoading } = useCategoryListQuery();

  // Sync dayFrom/dayTo from picker to context
  useEffect(() => {
    if (dayFromPicker) filterContext.setDateFrom(dayFromPicker);
  }, [dayFromPicker, filterContext]);

  useEffect(() => {
    if (dayToPicker) filterContext.setDateTo(dayToPicker);
  }, [dayToPicker, filterContext]);

  const handleResetFilters = () => {
    filterContext.resetFilters();

    // Reset dayPicker contexts
    setDayFromPicker(undefined);
    setDayToPicker(undefined);

    // Reset month picker về this month
    const now = new Date();
    setMonthValue({ year: now.getFullYear(), month: now.getMonth() + 1 });
  };

  const handleSelectCategory = (categoryId: number | null) => {
    filterContext.setCategoryId(filterContext.categoryId === categoryId ? null : categoryId);
  };

  const handleSelectSortField = (e: React.ChangeEvent<HTMLSelectElement>) => {
    filterContext.setSortField(e.target.value);
  };

  const handleSelectSortOrder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    filterContext.setSortOrder(e.target.value as 'asc' | 'desc');
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

      {/* to-from filters */}
      <div className="flex items-center justify-between gap-4">
        <label className="floating-label">
          <span>{t('expenses.form.dayFrom')}</span>
          <input
            type="text"
            className="input input-lg"
            placeholder={t('expenses.form.dayFrom')}
            readOnly
            value={filterContext.dateFrom?.toLocaleDateString() ?? ''}
            onClick={() => openDayFromPicker()}
          />
          <CalendarDaysIcon size={20} className="absolute right-2 top-1/2 transform -translate-y-1/2 pe-1" />
        </label>

        <label className="floating-label">
          <span>{t('expenses.form.dayTo')}</span>
          <input
            type="text"
            className="input input-lg"
            placeholder={t('expenses.form.dayTo')}
            readOnly
            value={filterContext.dateTo?.toLocaleDateString() ?? ''}
            onClick={() => openDayToPicker()}
          />
          <CalendarDaysIcon size={20} className="absolute right-2 top-1/2 transform -translate-y-1/2 pe-1" />
        </label>
      </div>

      {/* type and sort filters */}
      <div className="grid grid-cols-3 items-center gap-y-4">
        <label className="label text-lg">{t('expenses.form.type')}</label>
        <select
          className="select select-lg col-span-2 capitalize"
          value={filterContext.type ?? ''}
          onChange={(e) => filterContext.setType(e.target.value ? (e.target.value as ExpenseTypeEnum) : null)}
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
            onChange={handleSelectSortField}
          >
            <option value="expenses.date">{t('expenses.form.date')}</option>
            <option value="expenses.amount">{t('expenses.form.amount')}</option>
            <option value="categories.name">{t('expenses.form.name')}</option>
          </select>
          <select
            className="select select-lg join-item"
            value={filterContext.sortOrder}
            onChange={handleSelectSortOrder}
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
                onClick={() => handleSelectCategory(category.id)}
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
        <button className="btn btn-soft rounded-xl flex-2/3" onClick={handleResetFilters}>
          <ListRestart />
          {t('expenses.form.reset')}
        </button>
      </div>
    </Drawer>
  );
}

export default function ExpenseFilterSection() {
  const drawerRef = useRef<DrawerRef>(null!);

  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const { resolvedTheme } = useThemeContext();
  const filterContext = useExpenseFilterContext();

  const date = new Date();
  const currentMonth = date.getMonth() + 1;
  const currentYear = date.getFullYear();

  const { month: monthValue, setMonth: setMonthValue, open: openMonthPicker } = useMonthPickerContext();

  // Sync month from picker to filter context
  useEffect(() => {
    if (monthValue) {
      filterContext.setMonth(monthValue);
    }
  }, [monthValue, filterContext]);

  // Set default month
  useEffect(() => {
    if (monthValue) return;
    setMonthValue({ year: currentYear, month: currentMonth });
  }, [currentMonth, currentYear, monthValue, setMonthValue]);

  const monthDisplayText = useMemo(() => {
    if (filterContext.dateFrom || filterContext.dateTo) {
      return t('expenses.form.custom');
    }
    if (monthValue?.year === currentYear && monthValue?.month === currentMonth) {
      return t('expenses.form.thisMonth');
    }
    if (monthValue?.month) {
      return getMonthLabel(monthValue.month, locale);
    }
    return t('expenses.form.thisMonth');
  }, [filterContext.dateFrom, filterContext.dateTo, monthValue, currentYear, currentMonth, t, locale]);

  const handleNextMonth = () => {
    if (!monthValue) return;
    if (monthValue.month < 12) setMonthValue({ year: monthValue.year, month: monthValue.month + 1 });
    else setMonthValue({ year: monthValue.year + 1, month: 1 });
  };

  const handlePrevMonth = () => {
    if (!monthValue) return;
    if (monthValue.month > 1) setMonthValue({ year: monthValue.year, month: monthValue.month - 1 });
    else setMonthValue({ year: monthValue.year - 1, month: 12 });
  };

  return (
    <div
      className={`flex flex-col px-4 pb-2 border-b border-base-content/20 sticky top-0 mb-0 z-10 ${resolvedTheme === ThemeEnum.DARK ? 'bg-neutral' : 'bg-white'}`}
    >
      <div className="relative flex items-center justify-center">
        <div className="join w-[65vw]">
          <button className="btn btn-ghost join-item" onClick={handlePrevMonth}>
            <ChevronLeft size={20} />
          </button>
          <button className="btn btn-ghost join-item flex-1" onClick={() => openMonthPicker()}>
            {monthDisplayText}
          </button>

          <button className="btn btn-ghost join-item" onClick={handleNextMonth}>
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
