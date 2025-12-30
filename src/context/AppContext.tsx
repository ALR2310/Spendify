import { createContext, useEffect, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';

import { Emitter } from '@/common/emitter';
import { CheckForUpdatesResponse, UpdaterEvents } from '@/common/types/updater.type';
import { appConfig } from '@/configs/app.config';
import {
  useGoogleGetUserInfoQuery,
  useGoogleIsLoggedInQuery,
  useGoogleLoginMutation,
  useGoogleLogoutMutation,
} from '@/hooks/apis/googleauth.hook';
import { useStorageSyncMutation } from '@/hooks/apis/storage.hook';
import { GoogleUserInfo } from '@/services/googleauth.service';
import { updaterService } from '@/services/updater.service';

interface AppContextType {
  // Auth
  isLoggedIn: boolean;
  userInfo?: GoogleUserInfo | null;
  login(): Promise<void>;
  logout(): Promise<void>;
  // Updater
  checkForUpdates: () => Promise<CheckForUpdatesResponse>;
  downloadAndInstall: () => void;
  progress?: number;
  isDownloading: boolean;
  // Data
  syncData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const eventRef = useRef<Emitter<UpdaterEvents> | null>(null);

  const [progress, setProgress] = useState<number>();
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: isLoggedIn } = useGoogleIsLoggedInQuery();
  const { data: userInfo, refetch: refetchUserInfo } = useGoogleGetUserInfoQuery();

  const { mutateAsync: loginGoogle } = useGoogleLoginMutation();
  const { mutateAsync: logoutGoogle } = useGoogleLogoutMutation();
  const { mutateAsync: syncDataMethod } = useStorageSyncMutation();

  const login = async () => {
    try {
      await loginGoogle();
      queryClient.setQueryData(['googleauth', 'isLoggedIn'], true);
      refetchUserInfo();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutGoogle();
      queryClient.setQueryData(['googleauth', 'isLoggedIn'], false);
      queryClient.setQueryData(['googleauth', 'getUserInfo'], null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const syncData = async () => {
    if (!isLoggedIn || appConfig.data.firstSync) return;

    await syncDataMethod().catch((error) => {
      console.warn('Failed to sync data:', error);
    });
  };

  const checkForUpdates = () => updaterService.checkForUpdates();

  const downloadAndInstall = () => {
    setIsDownloading(true);

    if (eventRef.current) return;

    eventRef.current = updaterService.downloadAndInstall();

    eventRef.current
      .on('progress', (prog) => {
        setProgress(prog);
      })
      .on('complete', () => {
        setProgress(undefined);
        setIsDownloading(false);
        eventRef.current = null;
      })
      .on('error', () => {
        setProgress(undefined);
        setIsDownloading(false);
        eventRef.current = null;
      });
  };

  useEffect(() => {
    return () => {
      eventRef.current?.destroy();
      eventRef.current = null;
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        // Auth
        isLoggedIn: isLoggedIn ?? false,
        userInfo,
        login,
        logout,
        // Updater
        checkForUpdates,
        downloadAndInstall,
        progress,
        isDownloading,
        // Data
        syncData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
export type { AppContextType };
