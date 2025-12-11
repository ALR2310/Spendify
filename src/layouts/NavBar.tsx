import { ChartBarStacked, NotebookPen, Settings, Wallet } from 'lucide-react';
import { NavLink } from 'react-router';

import { ROUTES } from '@/common/constants/routes.const';

export default function DockNav() {
  return (
    <div className="dock dock-success dock-xs bg-base-300 relative">
      <NavLink to={ROUTES.EXPENSES} className={({ isActive }) => (isActive ? 'dock-active' : '')}>
        <Wallet size={20} />
      </NavLink>

      <NavLink to={ROUTES.STATISTICS} className={({ isActive }) => (isActive ? 'dock-active' : '')}>
        <ChartBarStacked size={20} />
      </NavLink>

      <NavLink to={ROUTES.NOTES} className={({ isActive }) => (isActive ? 'dock-active' : '')}>
        <NotebookPen size={20} />
      </NavLink>

      <NavLink to={ROUTES.SETTINGS} className={({ isActive }) => (isActive ? 'dock-active' : '')}>
        <Settings size={20} />
      </NavLink>
    </div>
  );
}
