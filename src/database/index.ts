import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { defineCustomElements } from 'jeep-sqlite/loader';
import { Kysely } from 'kysely';

import { logger } from '../common/logger';
import { CapacitorSQLiteDialect } from './driver';
import { Database as DatabaseType } from './types';

let database: SQLiteDBConnection;

const sqlite = new SQLiteConnection(CapacitorSQLite);

const createConnect = async () => {
  return await sqlite.createConnection('Spendify', false, 'no-encryption', 1, false);
};

const saveWebStore = async () => {
  if (!Capacitor.isNativePlatform()) {
    await sqlite.saveToStore('Spendify');
  }
  return true;
};

const persistentStore = async () => {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    const isPersisted = await navigator.storage.persisted();
    if (!isPersisted) {
      const isGranted = await navigator.storage.persist();
      logger.log(`Storage persistence granted: ${isGranted}`);
    } else {
      logger.log('Storage persistence previously granted');
    }
  }
};

const initDatabase = async () => {
  if (database) return database;

  const isNative = Capacitor.isNativePlatform();

  try {
    if (!isNative) {
      await persistentStore();
      defineCustomElements(window);
      await sqlite.initWebStore();
    }

    const con = await sqlite.checkConnectionsConsistency();
    if (!con.result && !isNative) {
      database = await createConnect();
    }
    database = database ?? (await createConnect());

    await database.open();

    logger.log('Connect to database successfully');

    return database;
  } catch (error) {
    logger.error('Error when connect to database', error);
    throw error;
  }
};

const db = new Kysely<DatabaseType>({
  dialect: new CapacitorSQLiteDialect(await initDatabase()),
});

export { database, db, initDatabase, saveWebStore };
