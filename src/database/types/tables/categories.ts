import { Insertable, Selectable, Updateable } from 'kysely';

import { BaseTable } from './base';

export type CategoriesTable = BaseTable & {
  name: string;
  icon?: string;
  color?: string;
};
export type SelectCategory = Selectable<CategoriesTable>;
export type NewCategory = Insertable<CategoriesTable>;
export type UpdateCategory = Updateable<CategoriesTable>;
