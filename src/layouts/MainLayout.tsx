import { Outlet } from 'react-router';

import DockNav from './DockNav';
import Nav from './Nav';

export default function MainLayout() {
  return (
    <div id="main-layout" className="h-screen flex flex-col pt-[env(safe-area-inset-top)] bg-neutral">
      <Nav />

      <div className="flex-1 overflow-auto no-scrollbar">
        <Outlet />
      </div>

      <DockNav />
    </div>
  );
}
