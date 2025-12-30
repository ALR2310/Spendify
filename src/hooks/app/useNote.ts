import { useContext } from 'react';

import { NoteDetailContext } from '@/pages/notes/context/NoteDetailContext';
import { NoteUpsertContext } from '@/pages/notes/context/NoteUpsertContext';

export function useNoteUpsertContext() {
  const ctx = useContext(NoteUpsertContext);
  if (!ctx) throw new Error('useNoteUpsertContext must be used within a NoteProvider');
  return ctx;
}

export function useNoteDetailContext() {
  const ctx = useContext(NoteDetailContext);
  if (!ctx) throw new Error('useNoteDetailContext must be used within a NoteDetailProvider');
  return ctx;
}
