import { useContext } from 'react';

import { NoteContext } from '@/pages/notes/context/NoteContext';

export function useNoteContext() {
  const ctx = useContext(NoteContext);
  if (!ctx) throw new Error('useNote must be used within a NoteProvider');
  return ctx;
}
