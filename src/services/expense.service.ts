import { db } from '@/common/database';
import { NewExpenses, UpdateExpenses } from '@/common/database/types/tables/expenses';

export const expenseService = new (class ExpenseService {
  async getAll() {
    try {
      const expenses = await db.selectFrom('expenses').selectAll().execute();
      return expenses;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  }

  async getById(id: number) {
    try {
      const expense = await db.selectFrom('expenses').selectAll().where('id', '=', id).executeTakeFirst();
      return expense;
    } catch (error) {
      console.error('Error fetching expense by ID:', error);
      throw error;
    }
  }

  async create(data: NewExpenses) {
    try {
      const expense = await db.insertInto('expenses').values(data).returningAll().executeTakeFirst();
      return expense;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateExpenses) {
    try {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Expense not found');

      const expense = await db.updateTable('expenses').set(data).where('id', '=', id).returningAll().executeTakeFirst();
      return expense;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Expense not found');

      await db.deleteFrom('expenses').where('id', '=', id).execute();
      return existing;
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }
})();
