import { Insertable, Selectable, Updateable } from 'kysely';

import { BaseTable } from './base';

export type NotesTable = BaseTable & {
  title: string;
  content: string;
};
export type Notes = Selectable<NotesTable>;
export type NewNotes = Insertable<NotesTable>;
export type UpdateNotes = Updateable<NotesTable>;
