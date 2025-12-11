import { Info, RefreshCw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { appConfig } from '@/configs/app.config';

import SettingItem from '../components/SettingItem';
import SettingSection from '../components/SettingSection';

export default function SettingAppSection() {
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
    <SettingSection title={t('settings.app.title')}>
      {/* Auto Update App */}
      <SettingItem
        icon={RefreshCw}
        iconColor="accent"
        title={t('settings.app.appAutoUpdate')}
        description={t('settings.app.appAutoUpdateDesc')}
        action={
          <input
            type="checkbox"
            className="toggle toggle-success"
            checked={autoUpdate}
            onChange={(e) => setAutoUpdate(e.target.checked)}
          />
        }
      />

      {/* Check for Updates */}
      <SettingItem
        icon={Search}
        iconColor="info"
        title={t('settings.app.checkUpdate')}
        description={t('settings.app.checkUpdateDesc')}
        onClick={handleCheckUpdate}
        showChevron
        showBorder
        hoverColor="info"
      />

      {/* App Version */}
      <SettingItem
        icon={Info}
        iconColor="neutral"
        title={t('settings.appInfo.version')}
        description={appConfig.version}
        showBorder
      />
    </SettingSection>
  );
}
