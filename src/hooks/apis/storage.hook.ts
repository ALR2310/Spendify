import { useMutation } from 'react-query';

import { storageService } from '@/services/storage.service';

export function useStorageImportMutation() {
  return useMutation({
    mutationFn: storageService.import,
  });
}

export function useStorageExportMutation() {
  return useMutation({
    mutationFn: storageService.export,
  });
}

export function useStorageSyncMutation() {}
