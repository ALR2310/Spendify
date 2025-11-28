import { Insertable, Selectable, Updateable } from 'kysely';

import { BaseTable } from './base';

export enum ExpenseTypeEnum {
  Income = 'income',
  Expense = 'expense',
}

export type ExpensesTable = BaseTable & {
  categoryId: number;
  name: string;
  date: string;
  amount: number;
  type: ExpenseTypeEnum;
  note?: string;
};
export type Expenses = Selectable<ExpensesTable>;
export type NewExpenses = Insertable<ExpensesTable>;
export type UpdateExpenses = Updateable<ExpensesTable>;
