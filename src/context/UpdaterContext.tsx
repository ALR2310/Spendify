import { createContext, useEffect, useRef, useState } from 'react';

import { Emitter } from '@/common/emitter';
import { CheckForUpdatesResponse, UpdaterEvents } from '@/common/types/updater.type';
import { updaterService } from '@/services/updater.service';

interface UpdaterContextType {
  checkForUpdates: () => Promise<CheckForUpdatesResponse>;
  downloadAndInstall: () => void;
  progress?: number;
  isDownloading: boolean;
}

const UpdaterContext = createContext<UpdaterContextType>(null!);

const UpdaterProvider = ({ children }: { children: React.ReactNode }) => {
  const eventRef = useRef<Emitter<UpdaterEvents> | null>(null);

  const [progress, setProgress] = useState<number>();
  const [isDownloading, setIsDownloading] = useState(false);

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

  const ctx = {
    checkForUpdates,
    downloadAndInstall,
    progress,
    isDownloading,
  };
  return <UpdaterContext.Provider value={ctx}>{children}</UpdaterContext.Provider>;
};

export { UpdaterContext, UpdaterProvider };
export type { UpdaterContextType };
