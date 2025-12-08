import { useMutation, useQuery } from 'react-query';

import { storageService } from '@/services/storage.service';
import { StorageExportResponse } from '@/shared/types/storage.type';

export function useStorageImportMutation() {
  return useMutation({
    mutationFn: (data: StorageExportResponse) => storageService.import(data),
  });
}

export function useStorageExportMutation() {
  return useMutation({
    mutationFn: () => storageService.export(),
  });
}

export function useStorageStatusQuery() {
  return useQuery({
    queryKey: ['storage/status'],
    queryFn: () => storageService.status(),
  });
}

export function useStorageSyncMutation() {
  return useMutation({
    mutationFn: () => storageService.sync(),
  });
}

export function useStorageUploadMutation() {
  return useMutation({
    mutationFn: () => storageService.upload(),
  });
}

export function useStorageDownloadMutation() {
  return useMutation({
    mutationFn: () => storageService.download(),
  });
}
