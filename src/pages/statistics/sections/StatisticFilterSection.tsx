import { CalendarDaysIcon, Funnel, ListRestart } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeEnum } from '@/common/enums/appconfig.enum';
import Drawer, { DrawerRef } from '@/components/Drawer';
import { useThemeContext } from '@/hooks/app/useTheme';

function StatisticFilterDrawer({ ref }: { ref: React.RefObject<DrawerRef> }) {
  const { t } = useTranslation();

  return (
    <Drawer
      ref={ref}
      position="bottom"
      classNames={{
        drawer: 'min-h-[400px] p-4 space-y-4 z-99!',
        overlay: 'z-99!',
      }}
    >
      <div className="relative flex items-center justify-center mb-2">
        <h3 className="font-semibold text-lg">{t('statistics.filter.title')}</h3>
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2" onClick={() => ref.current.close()}>
          ✕
        </button>
      </div>

      {/* Date Range Filters */}
      <div className="flex items-center justify-between gap-4">
        <label className="floating-label flex-1">
          <span>{t('statistics.filter.startDate')}</span>
          <label className="input input-lg">
            <CalendarDaysIcon size={20} />
            <input type="date" className="grow" placeholder={t('statistics.filter.startDate')} />
          </label>
        </label>

        <label className="floating-label flex-1">
          <span>{t('statistics.filter.endDate')}</span>
          <label className="input input-lg">
            <CalendarDaysIcon size={20} />
            <input type="date" className="grow" placeholder={t('statistics.filter.endDate')} />
          </label>
        </label>
      </div>

      {/* Category Filter */}
      <div className="flex flex-col">
        <label className="label text-lg">{t('statistics.filter.category')}</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 1, name: t('statistics.category.food'), icon: '🍔' },
            { id: 2, name: t('statistics.category.transport'), icon: '🚗' },
            { id: 3, name: t('statistics.category.entertainment'), icon: '🎬' },
            { id: 4, name: t('statistics.category.utilities'), icon: '💡' },
          ].map((category) => (
            <button key={category.id} className="btn btn-lg flex flex-col items-center gap-0 btn-soft">
              <span className="text-xl">{category.icon}</span>
              <span className="text-xs line-clamp-1">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Type Filter */}
      <div className="flex flex-col gap-2">
        <label className="label text-lg">{t('statistics.filter.chartType')}</label>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn btn-lg btn-soft btn-success">📊 {t('statistics.chartType.barChart')}</button>
          <button className="btn btn-lg btn-soft">📈 {t('statistics.chartType.lineChart')}</button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-2 pt-4">
        <button className="btn btn-ghost rounded-xl flex-1" onClick={() => ref.current.close()}>
          {t('statistics.form.close')}
        </button>
        <button className="btn btn-soft rounded-xl flex-1">
          <ListRestart size={18} />
          {t('statistics.form.reset')}
        </button>
      </div>
    </Drawer>
  );
}

export default function StatisticFilterSection() {
  const { resolvedTheme } = useThemeContext();
  const { t } = useTranslation();

  const drawerRef = useRef<DrawerRef>(null!);

  return (
    <div
      className={`sticky top-0 z-20 w-full flex flex-col px-4 py-2 border-b border-base-content/20 ${resolvedTheme === ThemeEnum.DARK ? 'bg-neutral' : 'bg-white'}`}
    >
      <div className="relative flex items-center justify-center">
        <div className="text-center flex-1">
          <p className="font-semibold text-sm md:text-base text-base-content">{t('statistics.filter.period')}</p>
          <p className="text-xs md:text-sm text-base-content/60">Dec 2024</p>
        </div>

        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-0 top-1/2 -translate-y-1/2"
          onClick={() => drawerRef.current?.openDrawer()}
        >
          <Funnel size={18} />
        </button>
      </div>

      <StatisticFilterDrawer ref={drawerRef} />
    </div>
  );
}
