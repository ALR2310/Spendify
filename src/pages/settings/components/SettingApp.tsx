import { ChevronRight, Info, RefreshCw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { appConfig } from '@/common/appConfig';

export default function SettingApp() {
  const { t } = useTranslation();
  const [autoUpdate, setAutoUpdate] = useState<boolean>(appConfig.autoUpdate);

  useEffect(() => {
    appConfig.autoUpdate = autoUpdate;
  }, [autoUpdate]);

  const handleCheckUpdate = () => {
    // TODO: Implement check update functionality
    console.log('Check for updates');
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold text-base text-base-content/80 px-1">{t('settings.app.title')}</p>
      <div className="card shadow-sm bg-base-200 rounded-2xl overflow-hidden">
        {/* Auto Update App */}
        <div className="p-1">
          <div className="flex items-center gap-4 p-4 rounded-xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent">
              <RefreshCw size={20} />
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-semibold text-sm">{t('settings.app.appAutoUpdate')}</span>
              <span className="text-xs opacity-60">{t('settings.app.appAutoUpdateDesc')}</span>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-success"
              checked={autoUpdate}
              onChange={(e) => setAutoUpdate(e.target.checked)}
            />
          </div>
        </div>

        {/* Check for Updates */}
        <div className="border-t border-base-300/50 p-1">
          <button
            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-info/10 active:bg-info/20 transition-colors"
            onClick={handleCheckUpdate}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-info/10 text-info">
              <Search size={20} />
            </div>
            <div className="flex flex-col flex-1 text-left">
              <span className="font-semibold text-sm">{t('settings.app.checkUpdate')}</span>
              <span className="text-xs opacity-60">{t('settings.app.checkUpdateDesc')}</span>
            </div>
            <ChevronRight size={18} className="opacity-40" />
          </button>
        </div>

        {/* App Version */}
        <div className="border-t border-base-300/50 p-1">
          <div className="flex items-center gap-4 p-4 rounded-xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-base-content/10">
              <Info size={20} className="opacity-60" />
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-semibold text-sm">{t('settings.appInfo.version')}</span>
              <span className="text-xs opacity-60">{appConfig.version}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
