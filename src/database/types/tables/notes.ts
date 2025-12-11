import { Insertable, Selectable, Updateable } from 'kysely';

import { BaseTable } from './base';

export type NotesTable = BaseTable & {
  title: string;
  content: string;
};
export type SelectNote = Selectable<NotesTable>;
export type NewNote = Insertable<NotesTable>;
export type UpdateNote = Updateable<NotesTable>;
