import { LogIn, LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { appConfig } from '@/configs/app.config';
import { useAppContext } from '@/hooks/app/useApp';

import SettingItem from '../components/SettingItem';
import SettingSection from '../components/SettingSection';

export default function SettingAccountSection() {
  const { t } = useTranslation();

  const { isLoggedIn, userInfo, login, logout } = useAppContext();

  const handleLogin = async () => {
    try {
      await login();
      toast.success('Logged in successfully');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed');
    }
  };

  const handleLogout = async () => {
    await toast.promise(logout(), {
      pending: 'Logging out...',
      success: 'Logged out successfully',
      error: 'Logout failed',
    });

    appConfig.data.firstSync = true;
    appConfig.data.fileId = null;
    appConfig.data.dateSync = null;
  };

  return (
    <SettingSection title={t('settings.account.title')}>
      {isLoggedIn ? (
        <>
          <SettingItem icon={User} iconColor="success" title={t('settings.account.loggedIn')}>
            <span className="text-xs text-base-content/60">
              hello: <span className="text-success font-semibold">{userInfo?.email}</span>
            </span>
          </SettingItem>

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
