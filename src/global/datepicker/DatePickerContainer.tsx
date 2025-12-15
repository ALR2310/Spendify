import 'react-day-picker/style.css';

import { enUS, vi } from 'date-fns/locale';
import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { useTranslation } from 'react-i18next';

import { LanguageEnum } from '@/common/enums/appconfig.enum';
import Drawer, { DrawerRef } from '@/components/Drawer';

import { datePickerBus, DatePickerEvents } from './datePickerBus';

export default function DatePickerContainer() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const drawerRef = useRef<DrawerRef>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [month, setMonth] = useState<Date>(new Date());
  const [currentPickerId, setCurrentPickerId] = useState<string | undefined>(undefined);

  const handleOpen = (data: DatePickerEvents['open']) => {
    drawerRef.current?.openDrawer();
    setDate(data.initial);
    setCurrentPickerId(data.pickerId);
  };

  const handleClose = () => {
    drawerRef.current?.close();
  };

  const handleSelect = (date?: Date) => {
    datePickerBus.emit('select', { date: date, pickerId: currentPickerId });
    handleClose();
  };

  useEffect(() => {
    datePickerBus.on('open', handleOpen);
    datePickerBus.on('close', handleClose);

    return () => {
      datePickerBus.off('open', handleOpen);
      datePickerBus.off('close', handleClose);
    };
  }, []);

  const touchStartX = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const x = e.changedTouches[0].clientX;
    const delta = x - touchStartX.current;

    if (delta < -50) {
      const next = new Date(month);
      next.setMonth(next.getMonth() + 1);
      setMonth(next);
    } else if (delta > 50) {
      const prev = new Date(month);
      prev.setMonth(prev.getMonth() - 1);
      setMonth(prev);
    }
  };

  return (
    <Drawer ref={drawerRef} position="bottom" className="min-h-[389px] w-full rounded-t-2xl">
      <div className="flex-1 flex flex-col relative">
        <div className="relative flex items-center justify-center mb-2">
          <h3 className="font-semibold text-lg">{t('pickers.dayPicker.title')}</h3>
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2"
            onClick={() => drawerRef.current?.close()}
          >
            ✕
          </button>
        </div>

        <div
          className="flex-1 touch-none select-none bg-base-200 p-2 rounded-xl"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <DayPicker
            locale={lang === LanguageEnum.EN ? enUS : vi}
            month={month}
            onMonthChange={setMonth}
            animate
            mode="single"
            selected={date}
            onSelect={handleSelect}
            navLayout="around"
            showOutsideDays={false}
            fixedWeeks
            className="flex justify-center text-sm"
            classNames={{
              day: '',
              today: 'text-success',
              day_button: 'rdp-day_button w-12!',
              selected: 'text-success bg-success/5 rounded-xl',
              chevron: 'rdp-chevron fill-success!',
              outside: 'opacity-30',
            }}
          />
        </div>

        <button
          className="btn btn-sm btn-soft w-[25%] absolute right-4 bottom-4 z-9999"
          onClick={() => handleSelect(undefined)}
        >
          Clear
        </button>
      </div>
    </Drawer>
  );
}
