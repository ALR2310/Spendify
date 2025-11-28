import { Insertable, Selectable, Updateable } from 'node_modules/kysely/dist/cjs/util/column-type';

import { ExpensesTable } from './expenses';

export enum PeriodEnum {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  Yearly = 'yearly',
}

export type RecurringTable = Omit<ExpensesTable, 'date'> & {
  period: PeriodEnum;
  startDate: string;
  endDate?: string;
};
export type Recurring = Selectable<RecurringTable>;
export type NewRecurring = Insertable<RecurringTable>;
export type UpdateRecurring = Updateable<RecurringTable>;
