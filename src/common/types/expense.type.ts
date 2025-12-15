import { ExpenseTypeEnum, SelectExpense } from '@/database/types/tables/expenses';

import { BaseQueryParams, PaginatedResponse } from './base.type';

export type Expense = SelectExpense & {
  categoryName?: string;
  categoryIcon?: string;
};

export type ExpenseListQuery = BaseQueryParams & {
  categoryId?: number;
  type?: ExpenseTypeEnum;
  startDate?: string;
  endDate?: string;
};

export type ExpenseListResponse = PaginatedResponse<Expense>;

export type ExpenseOverview = {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    difference: number;
  };
  categoryDistribution: {
    id: number;
    name: string;
    amount: number;
    percentage: number;
  }[];
};

export type ExpenseOverviewQuery = {
  startDate?: string | null;
  endDate?: string | null;
};
