import { SelectCategory } from '@/database/types/tables/categories';
import { ExpenseTypeEnum } from '@/database/types/tables/expenses';

import { BaseQueryParams, PaginatedResponse } from './base.type';

export type CategoryStats = SelectCategory & {
  expenseCount?: number;
  totalAmount?: number;
};

export type CategoryStatsQuery = Omit<BaseQueryParams, 'searchField'> & {
  type?: ExpenseTypeEnum;
  startDate?: string | null;
  endDate?: string | null;
};

export type CategoryStatsResponse = PaginatedResponse<CategoryStats>;
