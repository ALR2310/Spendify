import { CategoriesTable } from './tables/categories';
import { ExpensesTable } from './tables/expenses';
import { NotesTable } from './tables/notes';
import { RecurringTable } from './tables/recurring';

export type Database = {
  expenses: ExpensesTable;
  categories: CategoriesTable;
  recurring: RecurringTable;
  notes: NotesTable;
};
