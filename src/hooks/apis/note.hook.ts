import { useMutation, useQuery } from 'react-query';

import { UpdateNotes } from '@/common/database/types/tables/notes';
import { noteService } from '@/services/note.service';

export function useNoteGetAll() {
  return useQuery({
    queryFn: noteService.getAll,
    queryKey: ['notes/getAll'],
  });
}

export function useNoteGetById(id: number) {
  return useQuery({
    queryFn: () => noteService.getById(id),
    queryKey: ['notes/getById', id],
    enabled: !!id,
  });
}

export function useNoteCreate() {
  return useMutation({
    mutationFn: noteService.create,
  });
}

export function useNoteUpdate() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNotes }) => noteService.update(id, data),
  });
}

export function useNoteDelete() {
  return useMutation({
    mutationFn: noteService.delete,
  });
}
