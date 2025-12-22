import { Outlet } from 'react-router';

import { NoteProvider } from '../context/NoteContext';

export default function NoteLayout() {
  return (
    <NoteProvider>
      <Outlet />
    </NoteProvider>
  );
}
