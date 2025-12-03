import { Insertable, Selectable, Updateable } from 'kysely';

import { BaseTable } from './base';

export enum ExpenseTypeEnum {
  Income = 'income',
  Expense = 'expense',
}

export type ExpensesTable = BaseTable & {
  categoryId: number;
  date: string;
  amount: number;
  type: ExpenseTypeEnum;
  note?: string;
};
export type SelectExpense = Selectable<ExpensesTable>;
export type NewExpense = Insertable<ExpensesTable>;
export type UpdateExpense = Updateable<ExpensesTable>;
