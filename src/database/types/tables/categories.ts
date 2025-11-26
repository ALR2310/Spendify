import { Insertable, Selectable, Updateable } from 'kysely';
import { BaseTable } from './base';

export type CategoriesTable = BaseTable & {
  name: string;
  icon?: string;
  color?: string;
};
export type Categories = Selectable<CategoriesTable>;
export type NewCategories = Insertable<CategoriesTable>;
export type UpdateCategories = Updateable<CategoriesTable>;
