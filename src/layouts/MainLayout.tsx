import { Capacitor } from '@capacitor/core';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useOutlet } from 'react-router';

import { appConfig } from '@/configs/app.config';
import { confirm } from '@/global/confirm';
import { useRecurringExecuteSchedules } from '@/hooks/apis/recurring.hook';
import { useAppContext } from '@/hooks/app/useApp';
import { getPageDirection } from '@/hooks/app/usePageTransition';

import Header from './Header';
import DockNav from './NavBar';

export default function MainLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const { checkForUpdates, downloadAndInstall } = useAppContext();
  const { mutate: executeSchedules } = useRecurringExecuteSchedules();

  const direction = useMemo(() => getPageDirection(location.pathname), [location.pathname]);

  const variants = {
    animate: { opacity: 1, x: 0 },
    initial: (dir: number) => ({ opacity: 0, x: `${dir * 100}%` }),
    exit: (dir: number) => ({ opacity: 0, x: `${dir * -100}%` }),
  };

  const handleCheckUpdate = useCallback(async () => {
    const check = await checkForUpdates();
    if (!check.hasUpdate) return;

    const ok = await confirm(
      'An update is available. Do you want to download and install it now?',
      'Update Available',
    );

    if (!ok) return;

    downloadAndInstall();
  }, [checkForUpdates, downloadAndInstall]);

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    if (appConfig.autoUpdate && isNative) {
      handleCheckUpdate();
    }

    executeSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="main-layout" className="h-screen flex flex-col pt-[env(safe-area-inset-top)] bg-neutral">
      <Header />
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={location.pathname}
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: 0.15,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 overflow-auto no-scrollbar"
            style={{ willChange: 'transform, opacity' }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </div>
      <DockNav />
    </div>
  );
}
