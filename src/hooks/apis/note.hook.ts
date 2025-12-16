import { useMutation, useQuery } from 'react-query';

import { NewNote, UpdateNote } from '@/database/types/tables/notes';
import { noteService } from '@/services/note.service';

export function useNoteListQuery() {
  return useQuery({
    queryFn: () => noteService.getList(),
    queryKey: ['notes', 'getList'],
  });
}

export function useNoteByIdQuery(id: number) {
  return useQuery({
    queryFn: () => noteService.getById(id),
    queryKey: ['notes', 'getById', id],
    enabled: !!id,
  });
}

export function useNoteCreateMutation() {
  return useMutation({
    mutationFn: (data: NewNote) => noteService.create(data),
  });
}

export function useNoteUpdateMutation() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNote }) => noteService.update(id, data),
  });
}

export function useNoteDeleteMutation() {
  return useMutation({
    mutationFn: (id: number) => noteService.delete(id),
  });
}
