import { Outlet } from 'react-router';

import { NoteDetailProvider } from '../context/NoteDetailContext';
import { NoteUpsertProvider } from '../context/NoteUpsertContext';

export default function NoteLayout() {
  return (
    <NoteUpsertProvider>
      <NoteDetailProvider>
        <Outlet />
      </NoteDetailProvider>
    </NoteUpsertProvider>
  );
}
