import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import dayjs from 'dayjs';
import { Cloud, Download, RefreshCw, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

import { useStorageExportMutation, useStorageImportMutation } from '@/hooks/apis/storage.hook';
import { StorageExportResponse } from '@/shared/types/storage.type';

import SettingItem from '../components/SettingItem';
import SettingSection from '../components/SettingSection';

export default function SettingDataSection() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { mutateAsync: exportData } = useStorageExportMutation();
  const { mutateAsync: importData } = useStorageImportMutation();

  const handleImport = async () => {
    const result = await FilePicker.pickFiles({
      limit: 1,
      readData: true,
    });

    const base64Data = result.files[0]?.data;
    if (!base64Data) {
      toast.error('No file selected or file is empty.');
      return;
    }

    try {
      const textDecoder = new TextDecoder('utf-8');
      const jsonString = textDecoder.decode(Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0)));
      const data: StorageExportResponse = JSON.parse(jsonString);

      toast.promise(importData(data), {
        pending: 'Importing data...',
        success: 'Data imported successfully!',
        error: 'Failed to import data. Invalid file format.',
      });

      queryClient.invalidateQueries();
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Failed to import data. Invalid file format.');
    }
  };

  const handleExport = async () => {
    const data = await exportData();
    const dataStr = JSON.stringify(data, null, 2);

    try {
      const isNative = Capacitor.isNativePlatform();
      const fileName = `spendify-${dayjs().format('DD-MM-YYYY')}.json`;

      if (isNative) {
        const result = await Filesystem.writeFile({
          path: fileName,
          data: dataStr,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });

        toast.success(`Data exported to ${result.uri}`);
      } else {
        const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data.');
    }
  };

  return (
    <SettingSection title={t('settings.dataSync.title')}>
      {/* Data Sync */}
      <SettingItem
        icon={Cloud}
        iconColor="info"
        title={t('settings.dataSync.dataSyncTitle')}
        description={t('settings.dataSync.dataSyncDesc')}
        action={
          <button className="btn btn-sm btn-soft btn-success btn-circle">
            <RefreshCw size={16} />
          </button>
        }
      >
        <span className="text-xs opacity-40 mt-0.5">{'Not sync'}</span>
      </SettingItem>

      {/* Import Data */}
      <SettingItem
        icon={Upload}
        iconColor="accent"
        title={t('settings.dataSync.import')}
        description={t('settings.dataSync.importDesc')}
        onClick={handleImport}
        showChevron
        showBorder
        hoverColor="accent"
      />

      {/* Export Data */}
      <SettingItem
        icon={Download}
        iconColor="warning"
        title={t('settings.dataSync.export')}
        description={t('settings.dataSync.exportDesc')}
        onClick={handleExport}
        showChevron
        showBorder
        hoverColor="warning"
      />
    </SettingSection>
  );
}
