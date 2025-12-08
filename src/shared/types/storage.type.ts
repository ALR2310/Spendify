import { SelectCategory } from '@/common/database/types/tables/categories';
import { SelectExpense } from '@/common/database/types/tables/expenses';
import { SelectNote } from '@/common/database/types/tables/notes';
import { SelectRecurring } from '@/common/database/types/tables/recurring';

export type StorageExportResponse = {
  expenses: SelectExpense[];
  categories: SelectCategory[];
  recurring: SelectRecurring[];
  notes: SelectNote[];
  version: string;
};

export type StorageStatusResponse = {
  local: {
    exists: boolean;
    dateSync: string | null;
    fileLength: number;
  };
  cloud: {
    exists: boolean;
    dateSync: string | null;
    fileLength: number | null;
    fileId: string | null;
  };
};

export type StorageSyncResponse = {
  type: 'upload' | 'download' | 'skip';
  message?: string;
  fileId?: string | null;
};
