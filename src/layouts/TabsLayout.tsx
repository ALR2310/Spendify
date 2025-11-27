import { ROUTES } from '@/shared/constants/routes.const';
import { Wallet, ChartBarStacked, Settings } from 'lucide-react';

import { NavLink, Outlet } from 'react-router';

export default function TabsLayout() {
  return (
    <div className="h-screen flex flex-col pt-[env(safe-area-inset-top)]">
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      <div className="dock dock-success dock-xs bg-base-300">
        <NavLink to={ROUTES.EXPENSES} className={({ isActive }) => (isActive ? 'dock-active' : '')}>
          <Wallet size={20} />
        </NavLink>

        <NavLink to={ROUTES.STATISTICS} className={({ isActive }) => (isActive ? 'dock-active' : '')}>
          <ChartBarStacked size={20} />
        </NavLink>

        <NavLink to={ROUTES.SETTINGS} className={({ isActive }) => (isActive ? 'dock-active' : '')}>
          <Settings size={20} />
        </NavLink>
      </div>
    </div>
  );
}
