import { sql } from 'kysely';

import { logger } from '@/common/logger';
import { ExpenseListQuery, ExpenseListResponse } from '@/common/types/expense.type';
import { db, paginateQuery } from '@/database';
import { NewExpense, UpdateExpense } from '@/database/types/tables/expenses';

export const expenseService = new (class ExpenseService {
  async getList(query: ExpenseListQuery): Promise<ExpenseListResponse> {
    const {
      page,
      pageSize = 20,
      searchField,
      sortField = 'expenses.date',
      sortOrder = 'desc',
      categoryId,
      type,
      dateFrom,
      dateTo,
    } = query;

    try {
      let builder = db
        .selectFrom('expenses')
        .innerJoin('categories', 'expenses.categoryId', 'categories.id')
        .selectAll('expenses')
        .select(['categories.name as categoryName', 'categories.icon as categoryIcon']);

      if (categoryId) builder = builder.where('expenses.categoryId', '=', categoryId);
      if (type) builder = builder.where('expenses.type', '=', type);
      if (dateFrom) builder = builder.where('expenses.date', '>=', dateFrom);
      if (dateTo) builder = builder.where('expenses.date', '<=', dateTo);
      if (searchField)
        builder = builder.where((eb) =>
          eb.or([eb('expenses.note', 'like', `%${searchField}%`), eb('categories.name', 'like', `%${searchField}%`)]),
        );

      builder = builder.orderBy(sql.raw(sortField), sortOrder);

      return await paginateQuery(builder, {
        page,
        pageSize,
        countColumn: 'expenses.id',
      });
    } catch (error) {
      logger.error('Error fetching expenses:', error);
      throw error;
    }
  }

  async getById(id: number) {
    try {
      const expense = await db
        .selectFrom('expenses')
        .innerJoin('categories', 'expenses.categoryId', 'categories.id')
        .where('expenses.id', '=', id)
        .selectAll('expenses')
        .select(['categories.name as categoryName', 'categories.icon as categoryIcon'])
        .executeTakeFirst();
      return expense;
    } catch (error) {
      logger.error('Error fetching expense by ID:', error);
      throw error;
    }
  }

  async create(data: NewExpense) {
    try {
      const expense = await db.insertInto('expenses').values(data).returningAll().executeTakeFirst();
      return expense;
    } catch (error) {
      logger.error('Error creating expense:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateExpense) {
    try {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Expense not found');

      const expense = await db.updateTable('expenses').set(data).where('id', '=', id).returningAll().executeTakeFirst();
      return expense;
    } catch (error) {
      logger.error('Error updating expense:', error);
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
      logger.error('Error deleting expense:', error);
      throw error;
    }
  }
})();
