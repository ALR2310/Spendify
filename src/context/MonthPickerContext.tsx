import { ChevronLeft, ChevronRight } from 'lucide-react';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Drawer, { type DrawerRef } from '@/components/Drawer';
import { getMonthLabel } from '@/utils/general.utils';

interface MonthValue {
  year: number;
  month: number;
}

interface InternalState {
  resolve?: (v?: MonthValue) => void;
}

interface MonthPickerContextValue {
  openPicker: (initial?: MonthValue) => Promise<MonthValue | undefined>;
  closePicker: () => void;
  isOpen: boolean;
  value?: MonthValue;
  setValue: (v?: MonthValue) => void;
}

const MonthPickerContext = createContext<MonthPickerContextValue>(null!);

function MonthPickerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValueState] = useState<MonthValue>();
  const [internal, setInternal] = useState<InternalState>({});

  const openPicker = (initial?: MonthValue) => {
    return new Promise<MonthValue | undefined>((resolve) => {
      setValueState(initial);
      setInternal({ resolve });
      setIsOpen(true);
    });
  };

  const closePicker = () => {
    internal.resolve?.(undefined);
    setIsOpen(false);
  };

  const setValue = (v?: MonthValue) => {
    setValueState(v);
    internal.resolve?.(v);
    setIsOpen(false);
  };

  return (
    <MonthPickerContext.Provider
      value={{
        openPicker,
        closePicker,
        isOpen,
        value,
        setValue,
      }}
    >
      {children}
      <MonthPickerDrawer />
    </MonthPickerContext.Provider>
  );
}

function MonthPickerDrawer() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const { isOpen, value, setValue, closePicker } = useContext(MonthPickerContext);
  const drawerRef = useRef<DrawerRef>(null);
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState<number>(value?.year ?? currentYear);

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

  useEffect(() => {
    if (isOpen && value) {
      setYear(value.year);
    }
  }, [isOpen, value]);

  return (
    <Drawer ref={drawerRef} position="bottom" className="w-full rounded-t-2xl" onClose={closePicker}>
      <div className="p-3 pb-[env(safe-area-inset-bottom)]">
        <div className="relative flex items-center justify-center mb-2">
          <h3 className="font-semibold">{t('pickers.monthPicker.title')}</h3>
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2" onClick={closePicker}>
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
                ${value?.year === year && value?.month === m ? 'btn-soft btn-success' : 'btn-ghost'}
              `}
                onClick={() => setValue({ year, month: m })}
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
export type { MonthValue };
