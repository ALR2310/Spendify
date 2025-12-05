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

export type StorageGetStatusResponse = {
  type: 'local' | 'cloud';
  dateSync: string | null;
  fileLength: number | null;
};

export type StorageSyncResponse = {
  type: 'upload' | 'download' | 'noop';
  message?: string;
  fileId?: string;
};
