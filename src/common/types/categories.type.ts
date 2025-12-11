import { SelectCategory } from '@/database/types/tables/categories';
import { ExpenseTypeEnum } from '@/database/types/tables/expenses';

import { BaseQueryParams, PaginatedResponse } from './base.type';

export type CategoryStats = SelectCategory & {
  expenseCount?: number;
  totalAmount?: number;
};

export type CategoryStatsQuery = Omit<BaseQueryParams, 'searchField'> & {
  type?: ExpenseTypeEnum;
  dateFrom?: string;
  dateTo?: string;
};

export type CategoryStatsResponse = PaginatedResponse<CategoryStats>;
