import { Outlet } from 'react-router';

import Header from './Header';
import DockNav from './NavBar';

export default function MainLayout() {
  return (
    <div id="main-layout" className="h-screen flex flex-col pt-[env(safe-area-inset-top)] bg-neutral">
      <Header />

      <div className="flex-1 overflow-auto no-scrollbar">
        <Outlet />
      </div>

      <DockNav />
    </div>
  );
}
