import { AnimatePresence, motion } from 'motion/react';
import { useMemo } from 'react';
import { useLocation, useOutlet } from 'react-router';

import { getPageDirection } from '@/hooks/app/usePageTransition';

import Header from './Header';
import DockNav from './NavBar';

export default function MainLayout() {
  const location = useLocation();
  const outlet = useOutlet();

  const direction = useMemo(() => getPageDirection(location.pathname), [location.pathname]);

  const variants = {
    initial: (dir: number) => ({ opacity: 0, x: dir * 100 }),
    animate: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -100 }),
  };

  return (
    <div id="main-layout" className="h-screen flex flex-col pt-[env(safe-area-inset-top)] bg-neutral">
      <Header />
      <div className="flex-1 overflow-auto no-scrollbar relative">
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
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </div>
      <DockNav />
    </div>
  );
}
