import { sql } from 'kysely';

import { logger } from '@/common/logger';
import { CategoryStatsQuery, CategoryStatsResponse } from '@/common/types/categories.type';
import { db, paginateQuery } from '@/database';
import { NewCategory, UpdateCategory } from '@/database/types/tables/categories';

export const categoryService = new (class CategoryService {
  async getList() {
    try {
      const categories = await db
        .selectFrom('categories')
        .leftJoin('expenses', 'categories.id', 'expenses.categoryId')
        .selectAll('categories')
        .select((eb) => eb.fn.count<number>('expenses.id').as('expenseCount'))
        .groupBy('categories.id')
        .orderBy('expenseCount', 'desc')
        .orderBy('categories.createdAt', 'asc')
        .execute();
      return categories;
    } catch (error) {
      logger.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getById(id: number) {
    try {
      const category = await db.selectFrom('categories').selectAll().where('id', '=', id).executeTakeFirst();
      return category;
    } catch (error) {
      logger.error('Error fetching category by ID:', error);
      throw error;
    }
  }

  async getStats(query: CategoryStatsQuery): Promise<CategoryStatsResponse> {
    const { page, pageSize = 20, sortField = 'expenses.amount', sortOrder = 'desc', type, dateFrom, dateTo } = query;

    try {
      let builder = db
        .selectFrom('categories')
        .leftJoin('expenses', 'categories.id', 'expenses.categoryId')
        .selectAll('categories')
        .select((eb) => [
          eb.fn.count<number>('expenses.id').as('expenseCount'),
          eb.fn.coalesce(eb.fn.sum<number>('expenses.amount'), eb.val(0)).as('totalAmount'),
        ])
        .groupBy('categories.id')
        .orderBy(sql.raw(sortField), sortOrder);

      if (type) builder = builder.where('expenses.type', '=', type);
      if (dateFrom) builder = builder.where('expenses.date', '>=', dateFrom);
      if (dateTo) builder = builder.where('expenses.date', '<=', dateTo);

      const { data, pagination } = await paginateQuery(builder, {
        page,
        pageSize,
        countColumn: 'categories.id',
      });

      return { data, pagination };
    } catch (error) {
      logger.error('Error fetching category stats:', error);
      throw error;
    }
  }

  async create(data: NewCategory) {
    try {
      const category = await db.insertInto('categories').values(data).returningAll().executeTakeFirst();
      return category;
    } catch (error) {
      logger.error('Error creating category:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateCategory) {
    try {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Category not found');

      const category = await db
        .updateTable('categories')
        .set(data)
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirst();
      return category;
    } catch (error) {
      logger.error('Error updating category:', error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Category not found');

      await db.deleteFrom('categories').where('id', '=', id).execute();
      return existing;
    } catch (error) {
      logger.error('Error deleting category:', error);
      throw error;
    }
  }
})();
