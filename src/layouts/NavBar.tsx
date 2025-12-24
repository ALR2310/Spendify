import { ChartBarStacked, NotebookPen, Settings, SquarePlus, Wallet } from 'lucide-react';
import { NavLink } from 'react-router';

import { ROUTES } from '@/common/constants/routes.const';
import { useExpenseUpsertContext } from '@/hooks/app/useExpense';
import { useUpdaterContext } from '@/hooks/app/useUpdater';

export default function DockNav() {
  const { openModal } = useExpenseUpsertContext();
  const { progress, isDownloading } = useUpdaterContext();

  return (
    <div className="relative">
      <div className="dock dock-success dock-xs bg-base-300 relative">
        <NavLink to={ROUTES.EXPENSES} className={({ isActive }) => (isActive ? 'dock-active' : '')}>
          <Wallet size={20} />
        </NavLink>

        <NavLink to={ROUTES.STATISTICS} className={({ isActive }) => (isActive ? 'dock-active' : '')}>
          <ChartBarStacked size={20} />
        </NavLink>

        <div className="flex items-center justify-center">
          <button
            className={`text-accent flex items-center justify-center w-[80%] h-10 rounded-2xl 
            border border-accent/20 bg-accent/10 hover:bg-accent/20 transition-all duration-300 
            transform hover:scale-110 shadow-md hover:cursor-pointer hover:shadow-lg animate-pulse 
            hover:animate-none group active:scale-95`}
            onClick={() => openModal()}
          >
            <SquarePlus size={25} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <NavLink to={ROUTES.NOTES} className={({ isActive }) => (isActive ? 'dock-active' : '')}>
          <NotebookPen size={20} />
        </NavLink>

        <NavLink to={ROUTES.SETTINGS} className={({ isActive }) => (isActive ? 'dock-active' : '')}>
          <Settings size={20} />
        </NavLink>
      </div>

      {isDownloading && (
        <div className="absolute -top-0.5 h-1 w-full z-10 flex justify-center">
          <progress className="progress progress-success h-full w-full rounded-none" value={progress}></progress>
        </div>
      )}
    </div>
  );
}
