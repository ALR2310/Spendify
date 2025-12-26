import { Info, RefreshCw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

import { appConfig } from '@/configs/app.config';
import { confirm } from '@/global/confirm';
import { useAppContext } from '@/hooks/app/useApp';

import SettingItem from '../components/SettingItem';
import SettingSection from '../components/SettingSection';

export default function SettingAppSection() {
  const { t } = useTranslation();
  const [autoUpdate, setAutoUpdate] = useState<boolean>(appConfig.autoUpdate);
  const navigate = useNavigate();

  const { checkForUpdates, downloadAndInstall } = useAppContext();

  useEffect(() => {
    appConfig.autoUpdate = autoUpdate;
  }, [autoUpdate]);

  const handleCheckUpdate = async () => {
    const check = await checkForUpdates();
    if (!check.hasUpdate) {
      toast.info('No updates available');
      return;
    }

    const ok = await confirm(
      'An update is available. Do you want to download and install it now?',
      'Update Available',
    );

    if (!ok) return;

    downloadAndInstall();
  };

  return (
    <SettingSection title={t('settings.app.title')}>
      {/* Auto Update App */}
      <SettingItem
        icon={RefreshCw}
        iconColor="accent"
        hoverColor="accent"
        title={t('settings.app.appAutoUpdate')}
        description={t('settings.app.appAutoUpdateDesc')}
        action={
          <input
            type="checkbox"
            className="toggle toggle-accent"
            checked={autoUpdate}
            onChange={(e) => {
              setAutoUpdate(e.target.checked);
              appConfig.autoUpdate = e.target.checked;
            }}
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
        onClick={() => navigate('/test')}
      />
    </SettingSection>
  );
}
