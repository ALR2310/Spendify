import { useMutation, useQuery } from 'react-query';

import { UpdateRecurring } from '@/common/database/types/tables/recurring';
import { recurringService } from '@/services/recurring.service';

export function useRecurringListQuery() {
  return useQuery({
    queryFn: recurringService.getList,
    queryKey: ['recurring/getList'],
  });
}

export function useRecurringByIdQuery(id: number) {
  return useQuery({
    queryFn: () => recurringService.getById(id),
    queryKey: ['recurring/getById', id],
    enabled: !!id,
  });
}

export function useRecurringCreateMutation() {
  return useMutation({
    mutationFn: recurringService.create,
  });
}

export function useRecurringUpdateMutation() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRecurring }) => recurringService.update(id, data),
  });
}

export function useRecurringDeleteMutation() {
  return useMutation({
    mutationFn: recurringService.delete,
  });
}
