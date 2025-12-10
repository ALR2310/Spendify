import { ChevronLeft, ChevronRight } from 'lucide-react';
import { createContext, RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Drawer, { type DrawerRef } from '@/components/Drawer';
import { getMonthLabel } from '@/utils/general.utils';

interface MonthValue {
  year: number;
  month: number;
}

type MonthPickerSession = {
  initial?: MonthValue;
  onChange?: (month?: MonthValue) => void;
};

interface MonthPickerContextValue {
  open: (initial?: MonthValue, onChange?: (month?: MonthValue) => void) => void;
  close: () => void;
}

const MonthPickerContext = createContext<MonthPickerContextValue>(null!);

function MonthPickerProvider({ children }: { children: React.ReactNode }) {
  const drawerRef = useRef<DrawerRef>(null!);
  const [session, setSession] = useState<MonthPickerSession | null>(null);

  const open = (initial?: MonthValue, onChange?: (month?: MonthValue) => void) => {
    setSession({ initial, onChange });
    drawerRef.current?.openDrawer();
  };

  const close = () => {
    drawerRef.current?.close();
    setSession(null);
  };

  const handleSelect = (month?: MonthValue) => {
    if (session?.onChange) {
      session.onChange(month);
    }
    close();
  };

  const ctx = useMemo(() => ({ open, close }), []);

  return (
    <MonthPickerContext.Provider value={ctx}>
      {children}
      <MonthPickerDrawer drawerRef={drawerRef} session={session} onSelect={handleSelect} close={close} />
    </MonthPickerContext.Provider>
  );
}

function MonthPickerDrawer({
  drawerRef,
  session,
  onSelect,
  close,
}: {
  drawerRef: RefObject<DrawerRef>;
  session: MonthPickerSession | null;
  onSelect: (month?: MonthValue) => void;
  close: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState<number>(session?.initial?.year ?? currentYear);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (session?.initial) {
      setYear(session.initial.year);
    }
  }, [session?.initial]);

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

  const handleSelect = (month: number) => {
    onSelect({ year, month });
  };

  return (
    <Drawer ref={drawerRef} position="bottom" className="w-full rounded-t-2xl" onClose={close}>
      <div className="p-3 pb-[env(safe-area-inset-bottom)]">
        <div className="relative flex items-center justify-center mb-2">
          <h3 className="font-semibold">{t('pickers.monthPicker.title')}</h3>
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2" onClick={close}>
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
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <button
                key={m}
                className={`
                btn btn-sm
                ${session?.initial?.year === year && session?.initial?.month === m ? 'btn-soft btn-success' : 'btn-ghost'}
              `}
                onClick={() => handleSelect(m)}
              >
                {getMonthLabel(m, locale)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export { MonthPickerContext, MonthPickerProvider };
export type { MonthPickerContextValue, MonthValue };
