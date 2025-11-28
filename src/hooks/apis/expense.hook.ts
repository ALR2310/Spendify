import { UpdateExpenses } from '@/common/database/types/tables/expenses';
import { expenseService } from '@/services/expense.service';
import { useMutation, useQuery } from 'react-query';

export function useExpenseGetAll() {
  return useQuery({
    queryFn: expenseService.getAll,
    queryKey: ['expenses/getAll'],
  });
}

export function useExpenseGetById(id: number) {
  return useQuery({
    queryFn: () => expenseService.getById(id),
    queryKey: ['expenses/getById', id],
    enabled: !!id,
  });
}

export function useExpenseCreate() {
  return useMutation({
    mutationFn: expenseService.create,
  });
}

export function useExpenseUpdate() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExpenses }) => expenseService.update(id, data),
  });
}

export function useExpenseDelete() {
  return useMutation({
    mutationFn: expenseService.delete,
  });
}
