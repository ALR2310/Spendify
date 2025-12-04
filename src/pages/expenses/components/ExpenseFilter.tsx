import { ChevronLeft, ChevronRight, Funnel } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import Drawer, { DrawerRef } from '@/components/Drawer';
import { useMonthPickerContext } from '@/hooks/app/useMonthPicker';
import { getMonthLabel } from '@/utils/general.utils';

export default function ExpenseFilter() {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const drawerRef = useRef<DrawerRef>(null!);

  const date = new Date();
  const currentMonth = date.getMonth() + 1;
  const currentYear = date.getFullYear();

  const [monthValue, openPicker, _, setMonthValue] = useMonthPickerContext({
    year: currentYear,
    month: currentMonth,
  });

  return (
    <div className="flex flex-col">
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

        <button className="btn btn-sm btn-square btn-ghost absolute right-0 top-1/2 -translate-y-1/2">
          <Funnel size={16} />
        </button>
      </div>

      <div className="divider m-0"></div>

      <Drawer ref={drawerRef} position="bottom">
        {/* Drawer content can be added here in the future */}
      </Drawer>
    </div>
  );
}
