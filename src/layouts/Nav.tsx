import { Bell } from 'lucide-react';

export default function Nav() {
  return (
    <div className="navbar min-h-auto">
      <div className="navbar-start">
        <img src="/src/assets/images/icon.png" alt="" className="rounded-xl w-7" />
        <a className="btn btn-sm btn-ghost font-semibold text-lg">Spendify</a>
      </div>

      <div className="navbar-end">
        <button className="btn btn-xs btn-ghost btn-circle" disabled>
          <div className="indicator">
            <Bell size={20} />
            {/* <span className="badge badge-xs badge-success indicator-item"></span> */}
          </div>
        </button>
      </div>
    </div>
  );
}
