import { Outlet } from 'react-router';
import DockNav from './DockNav';

export default function MainLayout() {
  return (
    <div className="h-screen flex flex-col pt-[env(safe-area-inset-top)] bg-neutral">
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      <DockNav />
    </div>
  );
}
