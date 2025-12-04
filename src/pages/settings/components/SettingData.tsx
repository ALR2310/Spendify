import { ChevronRight, Cloud, Download, RefreshCw, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { appConfig } from '@/common/appConfig';

export default function SettingData() {
  const { t } = useTranslation();

  const handleImport = () => {
    // TODO: Implement import functionality
    console.log('Import data');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export data');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('settings.dataSync.notSynced');
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
      <p className="font-semibold text-base text-base-content/80 px-1">{t('settings.dataSync.title')}</p>
      <div className="card shadow-sm bg-base-200 rounded-2xl overflow-hidden">
        {/* Data Sync */}
        <div className="p-1">
          <div className="flex items-center gap-4 p-4 rounded-xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-info/10 text-info">
              <Cloud size={20} />
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-semibold text-sm">{t('settings.dataSync.dataSyncTitle')}</span>
              <span className="text-xs opacity-60">{t('settings.dataSync.dataSyncDesc')}</span>
              <span className="text-xs opacity-40 mt-0.5">{formatDate(appConfig.data.lastSync)}</span>
            </div>
            <button className="btn btn-sm btn-soft btn-success btn-circle">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Import Data */}
        <div className="border-t border-base-300/50 p-1">
          <button
            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-accent/10 active:bg-accent/20 transition-colors"
            onClick={handleImport}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent">
              <Upload size={20} />
            </div>
            <div className="flex flex-col flex-1 text-left">
              <span className="font-semibold text-sm">{t('settings.dataSync.import')}</span>
              <span className="text-xs opacity-60">{t('settings.dataSync.importDesc')}</span>
            </div>
            <ChevronRight size={18} className="opacity-40" />
          </button>
        </div>

        {/* Export Data */}
        <div className="border-t border-base-300/50 p-1">
          <button
            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-warning/10 active:bg-warning/20 transition-colors"
            onClick={handleExport}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-warning/10 text-warning">
              <Download size={20} />
            </div>
            <div className="flex flex-col flex-1 text-left">
              <span className="font-semibold text-sm">{t('settings.dataSync.export')}</span>
              <span className="text-xs opacity-60">{t('settings.dataSync.exportDesc')}</span>
            </div>
            <ChevronRight size={18} className="opacity-40" />
          </button>
        </div>
      </div>
    </div>
  );
}
