import { useMutation, useQuery } from 'react-query';

import { StorageExportResponse } from '@/common/types/storage.type';
import { storageService } from '@/services/storage.service';

export function useStorageDeleteMutation() {
  return useMutation({
    mutationFn: () => storageService.delete(),
  });
}

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

export function useStorageInfoQuery(enabled = true) {
  return useQuery({
    queryKey: ['storage', 'info'],
    queryFn: () => storageService.info(),
    enabled,
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
