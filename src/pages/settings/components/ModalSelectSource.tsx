import dayjs from 'dayjs';
import { Check, Cloud, HardDrive } from 'lucide-react';
import { memo, RefObject, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Modal, { ModalRef } from '@/components/Modal';
import { useGoogleIsLoggedInQuery } from '@/hooks/apis/googleauth.hook';
import { useStorageStatusQuery } from '@/hooks/apis/storage.hook';
import { formatBytes } from '@/utils/general.utils';

const iconColorClasses = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  accent: 'bg-accent/10 text-accent',
  info: 'bg-info/10 text-info',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  neutral: 'bg-base-content/10',
};

interface DataSource {
  type: 'cloud' | 'local';
  title: string;
  icon: typeof Cloud | typeof HardDrive;
  iconColor: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error' | 'neutral';
  fileSize: string;
  syncDate: string | null;
}

interface ModalSelectSourceProps {
  modalRef: RefObject<ModalRef>;
  onSelect?: (source?: DataSource['type']) => void;
}

export default function ModalSelectSource({ modalRef, onSelect }: ModalSelectSourceProps) {
  const { t } = useTranslation();

  const [selectedSource, setSelectedSource] = useState<DataSource['type']>();

  const { data: isLoggedIn } = useGoogleIsLoggedInQuery();
  const { data: storages } = useStorageStatusQuery(isLoggedIn ?? false);

  const data: DataSource[] = storages
    ? [
        {
          type: 'cloud',
          title: t('settings.dataSync.conflictModal.googleDrive'),
          icon: Cloud,
          iconColor: 'info',
          fileSize: formatBytes(storages.cloud?.fileLength ?? 0),
          syncDate: storages.cloud?.dateSync ?? null,
        },
        {
          type: 'local',
          title: t('settings.dataSync.conflictModal.localStorage'),
          icon: HardDrive,
          iconColor: 'accent',
          fileSize: formatBytes(storages.local?.fileLength ?? 0),
          syncDate: storages.local?.dateSync ?? null,
        },
      ]
    : [];

  const handleSelect = (source: 'cloud' | 'local') => {
    setSelectedSource(source);
  };

  const handleConfirm = () => {
    if (selectedSource && onSelect) {
      onSelect(selectedSource);
    }
    modalRef.current?.close();
    setSelectedSource(undefined);
  };

  const handleCancel = () => {
    setSelectedSource(undefined);
    modalRef.current?.close();
  };

  return (
    <Modal
      ref={modalRef}
      title="Select Data source"
      classNames={{ modalBox: 'max-w-2xl' }}
      buttonSubmit={{ onClick: handleConfirm }}
      buttonCancel={{ onClick: handleCancel }}
      onClose={() => {
        if (onSelect) onSelect(undefined);
        setSelectedSource(undefined);
      }}
    >
      <div className="flex flex-col gap-4 py-2">
        <p className="text-sm text-base-content/70">{t('settings.dataSync.conflictModal.message')}</p>

        <div className="flex flex-col gap-3">
          {data.map((source) => {
            const isSelected = selectedSource === source.type;

            return (
              <SourceItem key={source.type} source={source} isSelected={isSelected} onSelect={handleSelect} />
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

interface SourceItemProps {
  source: DataSource;
  isSelected: boolean;
  onSelect: (source: 'cloud' | 'local') => void;
}

const SourceItem = memo(({ source, isSelected, onSelect }: SourceItemProps) => {
  const { t } = useTranslation();

  const Icon = source.icon;

  return (
    <button
      onClick={() => onSelect(source.type)}
      className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-accent bg-accent/5 shadow-md'
          : 'border-base-300 hover:border-base-content/20 hover:bg-base-300/30'
      }`}
    >
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-xl ${iconColorClasses[source.iconColor]}`}
      >
        <Icon size={24} />
      </div>

      <div className="flex flex-col flex-1 text-left">
        <span className="font-semibold text-base">{source.title}</span>
        <div className="flex flex-col gap-1 mt-1">
          <span className="text-xs opacity-60">
            {t('settings.dataSync.conflictModal.fileSize')}{' '}
            <span className="font-medium opacity-80">{source.fileSize}</span>
          </span>
          <span className="text-xs opacity-60">
            {t('settings.dataSync.conflictModal.lastSync')}{' '}
            <span className="font-medium opacity-80">
              {source.syncDate
                ? dayjs(source.syncDate).format('DD/MM/YYYY HH:mm')
                : t('settings.dataSync.conflictModal.neverSynced')}
            </span>
          </span>
        </div>
      </div>

      {isSelected && (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-content">
          <Check size={18} />
        </div>
      )}
    </button>
  );
});
