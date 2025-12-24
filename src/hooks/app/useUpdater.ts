import { useContext } from 'react';

import { UpdaterContext } from '@/context/UpdaterContext';

export function useUpdaterContext() {
  const ctx = useContext(UpdaterContext);
  if (!ctx) throw new Error('useUpdater must be used within an UpdaterProvider');
  return ctx;
}
