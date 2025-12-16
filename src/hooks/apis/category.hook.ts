import { useMutation, useQuery } from 'react-query';

import { CategoryStatsQuery } from '@/common/types/categories.type';
import { NewCategory, UpdateCategory } from '@/database/types/tables/categories';
import { categoryService } from '@/services/category.service';

export function useCategoryListQuery() {
  return useQuery({
    queryFn: () => categoryService.getList(),
    queryKey: ['categories', 'getList'],
  });
}

export function useCategoryByIdQuery(id: number) {
  return useQuery({
    queryFn: () => categoryService.getById(id),
    queryKey: ['categories', 'getById', id],
    enabled: !!id,
  });
}

export function useCategoryStats(query: CategoryStatsQuery) {
  return useQuery({
    queryFn: () => categoryService.getStats(query),
    queryKey: ['categories', 'getStats', query],
  });
}

export function useCategoryCreateMutation() {
  return useMutation({
    mutationFn: (data: NewCategory) => categoryService.create(data),
  });
}

export function useCategoryUpdateMutation() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategory }) => categoryService.update(id, data),
  });
}

export function useCategoryDeleteMutation() {
  return useMutation({
    mutationFn: (id: number) => categoryService.delete(id),
  });
}
