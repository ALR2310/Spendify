import { CalendarDaysIcon, ChevronLeft, ChevronRight, Funnel } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ExpenseTypeEnum } from '@/common/database/types/tables/expenses';
import Drawer, { DrawerRef } from '@/components/Drawer';
import { useDayPickerContext } from '@/hooks/app/useDayPicker';
import { useMonthPickerContext } from '@/hooks/app/useMonthPicker';
import { useThemeContext } from '@/hooks/app/useTheme';
import { ThemeEnum } from '@/shared/enums/appconfig.enum';
import { getMonthLabel } from '@/utils/general.utils';

function ExpenseFilterDrawer({ ref }: { ref: React.RefObject<DrawerRef> }) {
  const { date: dayFrom, open: openDayFromPicker } = useDayPickerContext();
  const { date: dayTo, open: openDayToPicker } = useDayPickerContext();
  const [type, setType] = useState<ExpenseTypeEnum | null>(null);

  return (
    <Drawer ref={ref} position="bottom" className="min-h-[300px] p-4 space-y-4">
      <div className="relative flex items-center justify-center mb-2">
        <h3 className="font-semibold text-lg">Filters</h3>
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2" onClick={() => ref.current.close()}>
          ✕
        </button>
      </div>

      {/* to-from filters */}
      <div className="flex items-center justify-between gap-4">
        <label className="floating-label">
          <span>Day from</span>
          <input
            type="text"
            className="input input-lg"
            placeholder="Day from"
            readOnly
            value={dayFrom?.toLocaleDateString()}
            onClick={openDayFromPicker}
          />
          <CalendarDaysIcon size={20} className="absolute right-2 top-1/2 transform -translate-y-1/2 pe-1" />
        </label>

        <label className="floating-label">
          <span>Day to</span>
          <input
            type="text"
            className="input input-lg"
            placeholder="Day to"
            readOnly
            value={dayTo?.toLocaleDateString()}
            onClick={openDayToPicker}
          />
          <CalendarDaysIcon size={20} className="absolute right-2 top-1/2 transform -translate-y-1/2 pe-1" />
        </label>
      </div>

      {/* type and sort filters */}
      <div className="grid grid-cols-3 items-center gap-y-4">
        <label className="label text-lg">Type:</label>
        <select
          className="select select-lg col-span-2 capitalize"
          value={type ?? ''}
          onChange={(e) => setType(e.target.value as ExpenseTypeEnum)}
        >
          <option>All</option>
          {Object.values(ExpenseTypeEnum).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <label className="label text-lg">Sort by:</label>
        <div className="join col-span-2">
          <select className="select select-lg join-item">
            <option value="expenses.date">Date</option>
            <option value="expenses.amount">Amount</option>
            <option value="categories.name">Name</option>
          </select>
          <select className="select select-lg join-item">
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
      </div>

      {/* category filter */}
      <div className="flex flex-col">
        <label className="label text-lg">Category:</label>
        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
          {Array.from({ length: 9 * 3 }).map((_, index) => (
            <button key={index} className="btn btn-soft btn-lg flex flex-col items-center gap-0">
              <span>🍔</span>
              <span className="text-xs line-clamp-1">Category {index}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="btn btn-ghost rounded-xl flex-2/5">Reset</button>
        <button className="btn btn-soft btn-success rounded-xl flex-3/5">Apply</button>
      </div>
    </Drawer>
  );
}

export default function ExpenseFilter() {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const drawerRef = useRef<DrawerRef>(null!);
  const { theme } = useThemeContext();

  const date = new Date();
  const currentMonth = date.getMonth() + 1;
  const currentYear = date.getFullYear();

  const {
    value: monthValue,
    open: openPicker,
    setValue: setMonthValue,
  } = useMonthPickerContext({
    year: currentYear,
    month: currentMonth,
  });

  return (
    <div className={`flex flex-col sticky top-0 mb-0 z-10 ${theme === ThemeEnum.DARK ? 'bg-neutral' : 'bg-white'}`}>
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
          <button className="btn btn-ghost join-item flex-1" onClick={openPicker}>
            {monthValue?.year === currentYear && monthValue?.month === currentMonth
              ? 'This Month'
              : getMonthLabel(monthValue!.month, locale)}
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
