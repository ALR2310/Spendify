import { CalendarDaysIcon, ChevronLeft, ChevronRight, Funnel } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ExpenseTypeEnum } from '@/database/types/tables/expenses';
import Drawer, { DrawerRef } from '@/components/Drawer';
import { useDayPickerContext } from '@/hooks/app/useDayPicker';
import { useMonthPickerContext } from '@/hooks/app/useMonthPicker';
import { useThemeContext } from '@/hooks/app/useTheme';
import { ThemeEnum } from '@/common/enums/appconfig.enum';
import { getMonthLabel } from '@/utils/general.utils';

function ExpenseFilterDrawer({ ref }: { ref: React.RefObject<DrawerRef> }) {
  const { t } = useTranslation();
  const { date: dayFrom, open: openDayFromPicker } = useDayPickerContext();
  const { date: dayTo, open: openDayToPicker } = useDayPickerContext();
  const [type, setType] = useState<ExpenseTypeEnum | null>(null);

  return (
    <Drawer ref={ref} position="bottom" className="min-h-[300px] p-4 space-y-4">
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
            value={dayFrom?.toLocaleDateString()}
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
            value={dayTo?.toLocaleDateString()}
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
          value={type ?? ''}
          onChange={(e) => setType(e.target.value as ExpenseTypeEnum)}
        >
          <option>{t('expenses.filter.all')}</option>
          {Object.values(ExpenseTypeEnum).map((type) => (
            <option key={type} value={type}>
              {t(`expenses.filter.${type.toLowerCase()}`)}
            </option>
          ))}
        </select>

        <label className="label text-lg">{t('expenses.form.sortBy')}</label>
        <div className="join col-span-2">
          <select className="select select-lg join-item">
            <option value="expenses.date">{t('expenses.form.date')}</option>
            <option value="expenses.amount">{t('expenses.form.amount')}</option>
            <option value="categories.name">{t('expenses.form.name')}</option>
          </select>
          <select className="select select-lg join-item">
            <option value="desc">{t('expenses.form.desc')}</option>
            <option value="asc">{t('expenses.form.asc')}</option>
          </select>
        </div>
      </div>

      {/* category filter */}
      <div className="flex flex-col">
        <label className="label text-lg">{t('expenses.form.category')}</label>
        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
          {Array.from({ length: 9 * 3 }).map((_, index) => (
            <button key={index} className="btn btn-soft btn-lg flex flex-col items-center gap-0">
              <span>🍔</span>
              <span className="text-xs line-clamp-1">
                {t('expenses.filter.category')} {index}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="btn btn-ghost rounded-xl flex-2/5">{t('expenses.form.reset')}</button>
        <button className="btn btn-soft btn-success rounded-xl flex-3/5">{t('expenses.form.apply')}</button>
      </div>
    </Drawer>
  );
}

export default function ExpenseFilterSection() {
  const drawerRef = useRef<DrawerRef>(null!);

  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const { resolvedTheme } = useThemeContext();

  const date = new Date();
  const currentMonth = date.getMonth() + 1;
  const currentYear = date.getFullYear();

  const { month: monthValue, setMonth: setMonthValue, open: openMonthPicker } = useMonthPickerContext();

  useEffect(() => {
    if (monthValue) return;
    setMonthValue({ year: currentYear, month: currentMonth });
  }, [currentMonth, currentYear, monthValue, setMonthValue]);

  return (
    <div
      className={`flex flex-col px-4 pb-2 border-b border-base-content/20 sticky top-0 mb-0 z-10 ${resolvedTheme === ThemeEnum.DARK ? 'bg-neutral' : 'bg-white'}`}
    >
      <div className="relative flex items-center justify-center">
        <div className="join w-[65vw]">
          <button
            className="btn btn-ghost join-item"
            onClick={() => {
              if (!monthValue) return;
              if (monthValue.month > 1) setMonthValue({ year: monthValue.year, month: monthValue.month - 1 });
              else setMonthValue({ year: monthValue.year - 1, month: 12 });
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button className="btn btn-ghost join-item flex-1" onClick={() => openMonthPicker()}>
            {monthValue?.year === currentYear && monthValue?.month === currentMonth
              ? t('expenses.form.thisMonth')
              : monthValue?.month && getMonthLabel(monthValue.month, locale)}
          </button>

          <button
            className="btn btn-ghost join-item"
            onClick={() => {
              if (!monthValue) return;
              if (monthValue.month < 12) setMonthValue({ year: monthValue.year, month: monthValue.month + 1 });
              else setMonthValue({ year: monthValue.year + 1, month: 1 });
            }}
          >
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
