import { SelectCategory } from '@/database/types/tables/categories';
import { SelectExpense } from '@/database/types/tables/expenses';
import { SelectNote } from '@/database/types/tables/notes';
import { SelectRecurring } from '@/database/types/tables/recurring';

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
  type: 'upload' | 'download' | 'none';
  fileId?: string | null;
};

export type SpendingData = {
  spendingList: [
    {
      id: number;
      namelist: string;
      atcreate: string;
      atupdate: string;
      lastentry: string;
      status: number;
    },
  ];
  spendingItem: [
    {
      id: number;
      spendlistid: number;
      nameitem: string;
      price: number;
      details: string;
      atcreate: string;
      atupdate: string;
      status: number;
    },
  ];
  noted: [
    {
      id: number;
      namelist: string;
      content: string;
      atcreate: string;
      atupdate: string;
      status: number;
    },
  ];
  income: [
    {
      id: number;
      spendlistid: number;
      price: number;
      atcreate: string;
      atupdate: string;
      status: number;
    },
  ];
};
