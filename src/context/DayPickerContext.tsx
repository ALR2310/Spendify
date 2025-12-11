import 'react-day-picker/style.css';

import { enUS, vi } from 'date-fns/locale';
import { createContext, RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { useTranslation } from 'react-i18next';

import Drawer, { DrawerRef } from '@/components/Drawer';
import { LanguageEnum } from '@/common/enums/appconfig.enum';

type DayPickerSession = {
  initial?: Date;
  onChange?: (date?: Date) => void;
};

interface DayPickerContextValue {
  open: (initial?: Date, onChange?: (date?: Date) => void) => void;
  close: () => void;
}

const DayPickerContext = createContext<DayPickerContextValue>(null!);

function DayPickerProvider({ children }: { children: React.ReactNode }) {
  const drawerRef = useRef<DrawerRef>(null!);
  const [session, setSession] = useState<DayPickerSession | null>(null);

  const open = (initial?: Date, onChange?: (date?: Date) => void) => {
    setSession({ initial, onChange });
    drawerRef.current?.openDrawer();
  };

  const close = () => {
    drawerRef.current?.close();
    setSession(null);
  };

  const handleSelect = (date?: Date) => {
    if (session?.onChange) {
      session.onChange(date);
    }
    close();
  };

  const ctx = useMemo(() => ({ open, close }), []);

  return (
    <DayPickerContext.Provider value={ctx}>
      {children}
      <DayPickerDrawer drawerRef={drawerRef} session={session} onSelect={handleSelect} close={close} />
    </DayPickerContext.Provider>
  );
}

function DayPickerDrawer({
  drawerRef,
  session,
  onSelect,
  close,
}: {
  drawerRef: RefObject<DrawerRef>;
  session: DayPickerSession | null;
  onSelect: (date?: Date) => void;
  close: () => void;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [month, setMonth] = useState<Date>(session?.initial ?? new Date());

  useEffect(() => {
    if (session?.initial) {
      setMonth(session.initial);
    }
  }, [session?.initial]);

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

  const handleSelect = (date?: Date) => {
    onSelect(date);
  };

  return (
    <Drawer ref={drawerRef} position="bottom" className="min-h-[343px] w-full rounded-t-2xl">
      <div className="relative flex items-center justify-center mb-2">
        <h3 className="font-semibold text-lg">{t('pickers.dayPicker.title')}</h3>
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2" onClick={close}>
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
          selected={session?.initial}
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
    </Drawer>
  );
}

export { DayPickerContext, DayPickerProvider };
export type { DayPickerContextValue };
