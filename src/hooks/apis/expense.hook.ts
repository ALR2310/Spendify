import { useInfiniteQuery, useMutation, useQuery } from 'react-query';

import { UpdateExpense } from '@/common/database/types/tables/expenses';
import { expenseService } from '@/services/expense.service';
import { ExpenseListQuery } from '@/shared/types/expense.type';

export function useExpenseListQuery(query: ExpenseListQuery) {
  return useQuery({
    queryFn: () => expenseService.getList(query),
    queryKey: ['expenses/getList', query],
  });
}

export function useExpenseListInfinite(query: ExpenseListQuery) {
  return useInfiniteQuery({
    queryKey: ['expenses/getList', query],
    queryFn: ({ pageParam = 1 }) => expenseService.getList({ ...query, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}

export function useExpenseByIdQuery(id: number) {
  return useQuery({
    queryFn: () => expenseService.getById(id),
    queryKey: ['expenses/getById', id],
    enabled: !!id,
  });
}

export function useExpenseCreateMutation() {
  return useMutation({
    mutationFn: expenseService.create,
  });
}

export function useExpenseUpdateMutation() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExpense }) => expenseService.update(id, data),
  });
}

export function useExpenseDeleteMutation() {
  return useMutation({
    mutationFn: expenseService.delete,
  });
}
