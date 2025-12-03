import { Insertable, Selectable, Updateable } from 'node_modules/kysely/dist/cjs/util/column-type';

import { ExpensesTable } from './expenses';

export enum RecurringPeriodEnum {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  Yearly = 'yearly',
}

export type RecurringTable = Omit<ExpensesTable, 'date'> & {
  period: RecurringPeriodEnum;
  startDate: string;
  endDate?: string;
};
export type SelectRecurring = Selectable<RecurringTable>;
export type NewRecurring = Insertable<RecurringTable>;
export type UpdateRecurring = Updateable<RecurringTable>;
