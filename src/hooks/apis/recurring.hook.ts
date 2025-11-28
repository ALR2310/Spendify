import { UpdateRecurring } from '@/common/database/types/tables/recurring';
import { recurringService } from '@/services/recurring.service';
import { useMutation, useQuery } from 'react-query';

export function useRecurringGetAll() {
  return useQuery({
    queryFn: recurringService.getAll,
    queryKey: ['recurring/getAll'],
  });
}

export function useRecurringGetById(id: number) {
  return useQuery({
    queryFn: () => recurringService.getById(id),
    queryKey: ['recurring/getById', id],
    enabled: !!id,
  });
}

export function useRecurringCreate() {
  return useMutation({
    mutationFn: recurringService.create,
  });
}

export function useRecurringUpdate() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRecurring }) => recurringService.update(id, data),
  });
}

export function useRecurringDelete() {
  return useMutation({
    mutationFn: recurringService.delete,
  });
}
