import { Cloud,RefreshCw } from 'lucide-react';
import { useEffect,useState } from 'react';

import { appConfig } from '@/common/appConfig';

export default function SettingData() {
  const [autoUpdate, setAutoUpdate] = useState<boolean>(appConfig.autoUpdate);

  useEffect(() => {
    appConfig.autoUpdate = autoUpdate;
  }, [autoUpdate]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not synced';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold text-base text-base-content/80 px-1">Data & Sync</p>
      <div className="card shadow-sm bg-base-200 rounded-2xl overflow-hidden">
        {/* Auto Update */}
        <div className="p-1">
          <div className="flex items-center gap-4 p-4 rounded-xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent">
              <RefreshCw size={20} />
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-semibold text-sm">Auto Update</span>
              <span className="text-xs opacity-60">Automatically update data</span>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={autoUpdate}
              onChange={(e) => setAutoUpdate(e.target.checked)}
            />
          </div>
        </div>

        {/* Last Sync */}
        <div className="border-t border-base-300/50 p-1">
          <div className="flex items-center gap-4 p-4 rounded-xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-info/10 text-info">
              <Cloud size={20} />
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-semibold text-sm">Data Sync</span>
              <span className="text-xs opacity-60">{formatDate(appConfig.data.lastSync)}</span>
            </div>
            <button className="btn btn-sm btn-ghost btn-circle">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
