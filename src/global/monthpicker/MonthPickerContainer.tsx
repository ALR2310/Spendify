import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Drawer, { type DrawerRef } from '@/components/Drawer';
import { getMonthLabel } from '@/utils/general.utils';

import { monthPickerBus, MonthPickerEvents } from './monthPickerBus';

export default function MonthPickerContainer() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const currentYear = new Date().getFullYear();

  const drawerRef = useRef<DrawerRef>(null);
  const [month, setMonth] = useState<Date | undefined>(undefined);
  const [year, setYear] = useState<number>(currentYear);
  const [currentPickerId, setCurrentPickerId] = useState<string | undefined>(undefined);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleOpen = useCallback(
    (data: MonthPickerEvents['open']) => {
      drawerRef.current?.openDrawer();
      setMonth(data.initial);
      setCurrentPickerId(data.pickerId);
      if (data.initial) {
        setYear(data.initial.getFullYear());
      } else {
        setYear(currentYear);
      }
    },
    [currentYear],
  );

  const handleClose = () => {
    drawerRef.current?.close();
  };

  const handleSelect = (selectedMonth?: Date) => {
    monthPickerBus.emit('select', { month: selectedMonth, pickerId: currentPickerId });
    handleClose();
  };

  useEffect(() => {
    monthPickerBus.on('open', handleOpen);
    monthPickerBus.on('close', handleClose);

    return () => {
      monthPickerBus.off('open', handleOpen);
      monthPickerBus.off('close', handleClose);
    };
  }, [handleOpen]);

  useEffect(() => {
    if (month) {
      setYear(month.getFullYear());
    }
  }, [month]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
  };

  const onTouchEnd = () => {
    const delta = touchEndX.current - touchStartX.current;

    if (delta < -50) setYear((y) => y + 1);
    if (delta > 50) setYear((y) => y - 1);
  };

  const handleMonthSelect = (monthNumber: number) => {
    // Tạo Date với ngày 1 của tháng được chọn
    const selectedDate = new Date(year, monthNumber - 1, 1);
    handleSelect(selectedDate);
  };

  return (
    <Drawer ref={drawerRef} position="bottom" className="w-full rounded-t-2xl" onClose={handleClose}>
      <div className="p-3 pb-[env(safe-area-inset-bottom)]">
        <div className="relative flex items-center justify-center mb-2">
          <h3 className="font-semibold">{t('pickers.monthPicker.title')}</h3>
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2" onClick={handleClose}>
            ✕
          </button>
        </div>

        <div
          className="flex flex-col items-center gap-3 select-none touch-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="join w-full">
            <button className="btn btn-ghost text-success" onClick={() => setYear((y) => y - 1)}>
              <ChevronLeft size={20} />
            </button>
            <button className="btn btn-ghost flex-1 text-lg">{year}</button>
            <button className="btn btn-ghost text-success" onClick={() => setYear((y) => y + 1)}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
              const isSelected = month && month.getFullYear() === year && month.getMonth() + 1 === m;
              return (
                <button
                  key={m}
                  className={`btn btn-sm ${isSelected ? 'btn-soft btn-success' : 'btn-ghost'}`}
                  onClick={() => handleMonthSelect(m)}
                >
                  {getMonthLabel(m, locale)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
