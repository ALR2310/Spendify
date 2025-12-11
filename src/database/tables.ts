import { Capacitor } from '@capacitor/core';
import { sql } from 'kysely';

import { appConfig } from '../configs/app.config';
import { db, saveWebStore } from '.';
import { ExpenseTypeEnum } from './types/tables/expenses';
import { RecurringPeriodEnum } from './types/tables/recurring';

export async function initializeTables() {
  const native = Capacitor.isNativePlatform();

  if (!native) {
    const pragma: any = await sql.raw('PRAGMA user_version;').execute(db);
    const currentVersion = pragma.rows?.[0]?.user_version ?? 0;

    if (currentVersion == 0 && currentVersion !== appConfig.schemaVersion) {
      appConfig.data.dateSync = null;
      appConfig.data.fileId = null;
      appConfig.data.firstSync = true;

      await sql.raw(`PRAGMA user_version = ${appConfig.schemaVersion};`).execute(db);
      await saveWebStore();
    }
  }

  const expenseTypes = Object.values(ExpenseTypeEnum)
    .map((v) => `'${v}'`)
    .join(', ');
  const periodTypes = Object.values(RecurringPeriodEnum)
    .map((v) => `'${v}'`)
    .join(', ');

  await db.schema
    .createTable('categories')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('name', 'text', (col) => col.notNull().unique())
    .addColumn('icon', 'text')
    .addColumn('color', 'text')
    .addColumn('createdAt', 'text', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'text', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .ifNotExists()
    .execute();
  await db.schema.createIndex('idx_categories_createdAt').on('categories').column('createdAt').ifNotExists().execute();
  await db.schema.createIndex('idx_categories_updatedAt').on('categories').column('updatedAt').ifNotExists().execute();

  await db.schema
    .createTable('expenses')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('categoryId', 'integer', (col) => col.references('categories.id').notNull())
    .addColumn('date', 'text', (col) => col.notNull())
    .addColumn('amount', 'real', (col) => col.notNull())
    .addColumn('type', 'text', (col) => col.notNull().check(sql`type IN (${sql.raw(expenseTypes)})`))
    .addColumn('note', 'text')
    .addColumn('createdAt', 'text', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'text', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .ifNotExists()
    .execute();
  await db.schema.createIndex('idx_expenses_date').on('expenses').column('date').ifNotExists().execute();
  await db.schema.createIndex('idx_expenses_categoryId').on('expenses').column('categoryId').ifNotExists().execute();
  await db.schema.createIndex('idx_expenses_type').on('expenses').column('type').ifNotExists().execute();

  await db.schema
    .createTable('recurring')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('categoryId', 'integer', (col) => col.references('categories.id').notNull())
    .addColumn('amount', 'real', (col) => col.notNull())
    .addColumn('type', 'text', (col) => col.notNull().check(sql`type IN (${sql.raw(expenseTypes)})`))
    .addColumn('note', 'text')
    .addColumn('period', 'text', (col) => col.notNull().check(sql`period IN (${sql.raw(periodTypes)})`))
    .addColumn('startDate', 'text', (col) => col.notNull())
    .addColumn('endDate', 'text')
    .addColumn('createdAt', 'text', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'text', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .ifNotExists()
    .execute();
  await db.schema.createIndex('idx_recurring_categoryId').on('recurring').column('categoryId').ifNotExists().execute();
  await db.schema.createIndex('idx_recurring_type').on('recurring').column('type').ifNotExists().execute();
  await db.schema.createIndex('idx_recurring_period').on('recurring').column('period').ifNotExists().execute();
  await db.schema.createIndex('idx_recurring_startDate').on('recurring').column('startDate').ifNotExists().execute();
  await db.schema.createIndex('idx_recurring_endDate').on('recurring').column('endDate').ifNotExists().execute();

  await db.schema
    .createTable('notes')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('createdAt', 'text', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'text', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .ifNotExists()
    .execute();
  await db.schema.createIndex('idx_notes_title').on('notes').column('title').ifNotExists().execute();
  await db.schema.createIndex('idx_notes_createdAt').on('notes').column('createdAt').ifNotExists().execute();
  await db.schema.createIndex('idx_notes_updatedAt').on('notes').column('updatedAt').ifNotExists().execute();
}
