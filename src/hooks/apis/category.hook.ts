import { UpdateCategories } from '@/common/database/types/tables/categories';
import { categoryService } from '@/services/category.service';
import { useMutation, useQuery } from 'react-query';

export function useCategoryGetAll() {
  return useQuery({
    queryFn: categoryService.getAll,
    queryKey: ['categories/getAll'],
  });
}

export function useCategoryGetById(id: number) {
  return useQuery({
    queryFn: () => categoryService.getById(id),
    queryKey: ['categories/getById', id],
    enabled: !!id,
  });
}

export function useCategoryCreate() {
  return useMutation({
    mutationFn: categoryService.create,
  });
}

export function useCategoryUpdate() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategories }) => categoryService.update(id, data),
  });
}

export function useCategoryDelete() {
  return useMutation({
    mutationFn: categoryService.delete,
  });
}
