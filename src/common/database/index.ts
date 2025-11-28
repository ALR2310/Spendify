import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { defineCustomElements } from 'jeep-sqlite/loader';
import { Kysely } from 'kysely';
import { CapacitorSQLiteDialect } from './driver';
import { Database } from './types';
import { ExpenseTypeEnum } from './types/tables/expenses';
import { PeriodEnum } from './types/tables/recurring';

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

    // Create tables if they don't exist
    await initializeTables(dbInstance);

    console.log('Connect to database successfully');

    return dbInstance;
  } catch (error) {
    console.error('Error when connect to database', error);
    throw error;
  }
}

async function initializeTables(db: SQLiteDBConnection): Promise<void> {
  const expenseTypes = Object.values(ExpenseTypeEnum)
    .map((v) => `'${v}'`)
    .join(', ');
  const periodTypes = Object.values(PeriodEnum)
    .map((v) => `'${v}'`)
    .join(', ');

  const createCategoriesTable = `
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createExpensesTable = `
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoryId INTEGER NOT NULL,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK (type IN (${expenseTypes})),
      note TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    )
  `;

  const createRecurringTable = `
    CREATE TABLE IF NOT EXISTS recurring (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoryId INTEGER NOT NULL,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK (type IN (${expenseTypes})),
      note TEXT,
      period TEXT NOT NULL CHECK (period IN (${periodTypes})),
      startDate TEXT NOT NULL,
      endDate TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    )
  `;

  const createNotesTable = `
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await db.execute(createCategoriesTable);
    await db.execute(createExpensesTable);
    await db.execute(createRecurringTable);
    await db.execute(createNotesTable);

    console.log('Tables initialized successfully');
  } catch (error) {
    console.error('Error initializing tables:', error);
    throw error;
  }
}

const dbConnection = await database();

export const db = new Kysely<Database>({
  dialect: new CapacitorSQLiteDialect(dbConnection),
});
