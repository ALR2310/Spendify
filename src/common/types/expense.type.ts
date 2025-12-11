import { ExpenseTypeEnum, SelectExpense } from '@/database/types/tables/expenses';

import { BaseQueryParams, PaginatedResponse } from './base.type';

export type Expense = SelectExpense & {
  categoryName?: string;
  categoryIcon?: string;
};

export type ExpenseListQuery = BaseQueryParams & {
  categoryId?: number;
  type?: ExpenseTypeEnum;
  dateFrom?: string;
  dateTo?: string;
};

export type ExpenseListResponse = PaginatedResponse<Expense>;
