import { LogIn, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

import { appConfig } from '@/configs/app.config';
import { googleAuthService } from '@/services/googleauth.service';

import SettingItem from '../components/SettingItem';
import SettingSection from '../components/SettingSection';

export default function SettingAccountSection() {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleLogin = async () => {
    try {
      await googleAuthService.login();
      setIsLoggedIn(true);

      queryClient.invalidateQueries();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await googleAuthService.logout();
      setIsLoggedIn(false);

      toast.success('Logged out successfully');

      queryClient.invalidateQueries();
      appConfig.data.firstSync = true;
      appConfig.data.fileId = null;
      appConfig.data.dateSync = null;
    } catch (error) {}
  };

  return (
    <SettingSection title={t('settings.account.title')}>
      {isLoggedIn ? (
        <>
          <SettingItem
            icon={User}
            iconColor="success"
            title={t('settings.account.loggedIn')}
            description={t('settings.account.googleAccount')}
          />

          <SettingItem
            icon={LogOut}
            iconColor="error"
            title={t('settings.account.logOut')}
            description={t('settings.account.logOutDesc')}
            onClick={handleLogout}
            showChevron
            showBorder
            hoverColor="error"
          />
        </>
      ) : (
        <SettingItem
          icon={LogIn}
          iconColor="accent"
          title={t('settings.account.signIn')}
          description={t('settings.account.signInDesc')}
          onClick={handleLogin}
          showChevron
          hoverColor="accent"
        />
      )}
    </SettingSection>
  );
}
