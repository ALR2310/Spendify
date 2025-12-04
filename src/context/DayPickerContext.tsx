import 'react-day-picker/style.css';

import { enUS, vi } from 'date-fns/locale';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { useTranslation } from 'react-i18next';

import Drawer, { type DrawerRef } from '@/components/Drawer';
import { LanguageEnum } from '@/shared/enums/appconfig.enum';

interface InternalState {
  resolve?: (d?: Date) => void;
}

interface DayPickerContextValue {
  openPicker: (initial?: Date) => Promise<Date | undefined>;
  closePicker: () => void;
  isOpen: boolean;
  value?: Date;
  setValue: (d?: Date) => void;
}

const DayPickerContext = createContext<DayPickerContextValue>(null!);

function DayPickerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValueState] = useState<Date | undefined>();
  const [internal, setInternal] = useState<InternalState>({});

  const openPicker = (initial?: Date) => {
    return new Promise<Date | undefined>((resolve) => {
      setValueState(initial);
      setInternal({ resolve });
      setIsOpen(true);
    });
  };

  const closePicker = () => {
    internal.resolve?.(undefined);
    setIsOpen(false);
  };

  const setValue = (d?: Date) => {
    internal.resolve?.(d);
    setIsOpen(false);
  };

  return (
    <DayPickerContext.Provider
      value={{
        openPicker,
        closePicker,
        isOpen,
        value,
        setValue,
      }}
    >
      {children}
      <DayPickerDrawer />
    </DayPickerContext.Provider>
  );
}

function DayPickerDrawer() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const { isOpen, value, setValue, closePicker } = useContext(DayPickerContext);
  const drawerRef = useRef<DrawerRef>(null);

  const [month, setMonth] = useState<Date>(value ?? new Date());

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (isOpen) {
      drawerRef.current?.openDrawer();
    } else {
      drawerRef.current?.close();
    }
  }, [isOpen]);

  const onTouchStart = (e: React.TouchEvent) => {
    const x = e.changedTouches[0].clientX;
    touchStartX.current = x;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const x = e.changedTouches[0].clientX;
    touchEndX.current = x;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const x = e.changedTouches[0].clientX;
    const delta = x - touchStartX.current;

    if (delta < -50) {
      const next = new Date(month);
      next.setMonth(next.getMonth() + 1);
      setMonth(next);
    }

    if (delta > 50) {
      const prev = new Date(month);
      prev.setMonth(prev.getMonth() - 1);
      setMonth(prev);
    }
  };

  return (
    <Drawer ref={drawerRef} position="bottom" className="min-h-[343px] w-full rounded-t-2xl" onClose={closePicker}>
      <div className="relative flex items-center justify-center mb-2">
        <h3 className="font-semibold text-lg">{t('pickers.dayPicker.title')}</h3>
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2" onClick={closePicker}>
          ✕
        </button>
      </div>

      <div
        className="flex-1 touch-none select-none bg-base-200 p-2 rounded-xl"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <DayPicker
          locale={lang === LanguageEnum.EN ? enUS : vi}
          month={month}
          onMonthChange={setMonth}
          animate
          mode="single"
          selected={value}
          onSelect={setValue}
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
    </Drawer>
  );
}

export { DayPickerContext, DayPickerProvider };
