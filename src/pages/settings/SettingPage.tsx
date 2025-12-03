import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { appConfig } from '@/common/appConfig';

import SettingAccount from './components/SettingAccount';
import SettingAppearance from './components/SettingAppearance';
import SettingData from './components/SettingData';

export default function SettingPage() {
  const { t } = useTranslation();

  return (
    <div className="p-4 space-y-6 pb-24">
      <SettingAppearance />
      <SettingData />
      <SettingAccount />

      {/* App Info */}
      <div className="flex flex-col gap-2">
        <div className="card shadow-sm bg-base-200 rounded-2xl overflow-hidden">
          <div className="p-1">
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
    </div>
  );
}
