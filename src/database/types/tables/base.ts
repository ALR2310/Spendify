import { ColumnType, Generated } from 'kysely';

export type BaseTable = {
  id: Generated<number>;
  createdAt: ColumnType<string, string | undefined, never>;
  updatedAt: ColumnType<string, string | undefined, string>;
};
