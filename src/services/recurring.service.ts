import dayjs from 'dayjs';

import { logger } from '@/common/logger';
import { db } from '@/database';
import { NewRecurring, RecurringPeriodEnum, UpdateRecurring } from '@/database/types/tables/recurring';

import { expenseService } from './expense.service';

export const recurringService = new (class RecurringService {
  async getList() {
    try {
      const recurring = await db
        .selectFrom('recurring')
        .innerJoin('categories', 'recurring.categoryId', 'categories.id')
        .selectAll('recurring')
        .select(['categories.name as categoryName', 'categories.icon as categoryIcon'])
        .orderBy('updatedAt', 'desc')
        .execute();
      return recurring;
    } catch (error) {
      logger.error('Error fetching recurrings:', error);
      throw error;
    }
  }

  async getById(id: number) {
    try {
      const recurring = await db
        .selectFrom('recurring')
        .innerJoin('categories', 'recurring.categoryId', 'categories.id')
        .where('recurring.id', '=', id)
        .selectAll('recurring')
        .select(['categories.name as categoryName', 'categories.icon as categoryIcon'])
        .executeTakeFirst();
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

  async executeSchedules() {
    try {
      const schedules = await this.getList();
      if (schedules.length === 0) {
        logger.log('No recurring schedules found');
        return;
      }

      const today = dayjs().format('YYYY-MM-DD');
      const todayDate = dayjs(today).startOf('day');
      let totalCreated = 0;

      for (const schedule of schedules) {
        const startDate = dayjs(schedule.startDate).startOf('day');
        const endDate = schedule.endDate ? dayjs(schedule.endDate).startOf('day') : null;

        if (startDate.isAfter(todayDate) || (endDate && endDate.isBefore(todayDate))) {
          continue;
        }

        let fromDate = startDate;
        if (schedule.lastExecutedAt) {
          const lastExecuted = dayjs(schedule.lastExecutedAt).startOf('day');
          fromDate = this.getNextDateAfter(lastExecuted, schedule.period);
        }

        const toDate = endDate && endDate.isBefore(todayDate) ? endDate : todayDate;

        if (fromDate.isAfter(toDate)) {
          continue;
        }

        const datesToCreate = this.calculateDatesForSchedule(fromDate, toDate, schedule.period);

        let scheduleCreated = 0;
        for (const dateStr of datesToCreate) {
          const exists = await this.checkExpenseExists(schedule.id, dateStr);

          if (!exists) {
            await expenseService.create({
              categoryId: schedule.categoryId,
              date: dateStr,
              amount: schedule.amount,
              type: schedule.type,
              note: schedule.note,
              recurringId: schedule.id,
            });
            scheduleCreated++;
            totalCreated++;
            logger.log(`Created expense for recurring schedule ${schedule.id} on ${dateStr}`);
          }
        }

        if (scheduleCreated > 0 || datesToCreate.length > 0) {
          await this.update(schedule.id, {
            lastExecutedAt: today,
          });
        }
      }

      if (totalCreated > 0) {
        logger.log(`Executed recurring schedules: ${totalCreated} expenses created`);
      } else {
        logger.log('All recurring schedules are up to date');
      }
    } catch (error) {
      logger.error('Error executing recurring schedules:', error);
    }
  }

  private calculateDatesForSchedule(
    startDate: dayjs.Dayjs,
    endDate: dayjs.Dayjs,
    period: RecurringPeriodEnum,
  ): string[] {
    const dates: string[] = [];
    let currentDate = startDate;

    while (currentDate.isBefore(endDate, 'day') || currentDate.isSame(endDate, 'day')) {
      dates.push(currentDate.format('YYYY-MM-DD'));

      switch (period) {
        case RecurringPeriodEnum.Daily:
          currentDate = currentDate.add(1, 'day');
          break;
        case RecurringPeriodEnum.Weekly:
          currentDate = currentDate.add(1, 'week');
          break;
        case RecurringPeriodEnum.Monthly:
          currentDate = currentDate.add(1, 'month');
          break;
        case RecurringPeriodEnum.Yearly:
          currentDate = currentDate.add(1, 'year');
          break;
        default:
          currentDate = currentDate.add(1, 'day');
      }
    }

    return dates;
  }

  private getNextDateAfter(date: dayjs.Dayjs, period: RecurringPeriodEnum): dayjs.Dayjs {
    switch (period) {
      case RecurringPeriodEnum.Daily:
        return date.add(1, 'day');
      case RecurringPeriodEnum.Weekly:
        return date.add(1, 'week');
      case RecurringPeriodEnum.Monthly:
        return date.add(1, 'month');
      case RecurringPeriodEnum.Yearly:
        return date.add(1, 'year');
      default:
        return date.add(1, 'day');
    }
  }

  private async checkExpenseExists(recurringId: number, date: string): Promise<boolean> {
    try {
      const existing = await db
        .selectFrom('expenses')
        .select('id')
        .where('recurringId', '=', recurringId)
        .where('date', '=', date)
        .executeTakeFirst();

      return !!existing;
    } catch (error) {
      logger.error('Error checking expense existence:', error);
      return true;
    }
  }
})();
