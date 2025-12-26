import { Capacitor } from '@capacitor/core';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo } from 'react';
import { useLocation, useOutlet } from 'react-router';

import { appConfig } from '@/configs/app.config';
import { getPageDirection } from '@/hooks/app/usePageTransition';
import { useUpdaterContext } from '@/hooks/app/useUpdater';

import Header from './Header';
import DockNav from './NavBar';

export default function MainLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const { downloadAndInstall } = useUpdaterContext();

  const direction = useMemo(() => getPageDirection(location.pathname), [location.pathname]);

  const variants = {
    animate: { opacity: 1, x: 0 },
    initial: (dir: number) => ({ opacity: 0, x: `${dir * 100}%` }),
    exit: (dir: number) => ({ opacity: 0, x: `${dir * -100}%` }),
  };

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    if (appConfig.autoUpdate && isNative) {
      downloadAndInstall();
    }
  }, [downloadAndInstall]);

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
