import { logger } from '@/common/logger';
import { db } from '@/database';
import { NewRecurring, UpdateRecurring } from '@/database/types/tables/recurring';

export const recurringService = new (class RecurringService {
  async getList() {
    try {
      const recurring = await db.selectFrom('recurring').selectAll().execute();
      return recurring;
    } catch (error) {
      logger.error('Error fetching recurrings:', error);
      throw error;
    }
  }

  async getById(id: number) {
    try {
      const recurring = await db.selectFrom('recurring').selectAll().where('id', '=', id).executeTakeFirst();
      return recurring;
    } catch (error) {
      logger.error('Error fetching recurring by ID:', error);
      throw error;
    }
  }

  async create(data: NewRecurring) {
    try {
      const recurring = await db.insertInto('recurring').values(data).returningAll().executeTakeFirst();
      return recurring;
    } catch (error) {
      logger.error('Error creating recurring:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateRecurring) {
    try {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Recurring not found');

      const recurring = await db
        .updateTable('recurring')
        .set(data)
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirst();
      return recurring;
    } catch (error) {
      logger.error('Error updating recurring:', error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Recurring not found');

      await db.deleteFrom('recurring').where('id', '=', id).execute();
      return existing;
    } catch (error) {
      logger.error('Error deleting recurring:', error);
      throw error;
    }
  }
})();
