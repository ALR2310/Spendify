import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { defineCustomElements } from 'jeep-sqlite/loader';
import { Kysely, sql } from 'kysely';

import { CapacitorSQLiteDialect } from './driver';
import { Database } from './types';
import { ExpenseTypeEnum } from './types/tables/expenses';
import { RecurringPeriodEnum } from './types/tables/recurring';

let dbInstance: SQLiteDBConnection;

const sqlite = new SQLiteConnection(CapacitorSQLite);

const createConnect = async () => {
  return await sqlite.createConnection('Spendify', false, 'no-encryption', 1, false);
};

export async function database(): Promise<SQLiteDBConnection> {
  if (dbInstance) return dbInstance;

  try {
    if (Capacitor.getPlatform() === 'web') {
      defineCustomElements(window);
      await sqlite.initWebStore();
    }

    const ret = await sqlite.checkConnectionsConsistency();
    if (!ret.result && Capacitor.getPlatform() == 'web') {
      dbInstance = await createConnect();
    }
    dbInstance = dbInstance ?? (await createConnect());

    await dbInstance.open();

    console.log('Connect to database successfully');

    return dbInstance;
  } catch (error) {
    console.error('Error when connect to database', error);
    throw error;
  }
}

export const db = new Kysely<Database>({
  dialect: new CapacitorSQLiteDialect(await database()),
});

export async function initializeTables() {
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
