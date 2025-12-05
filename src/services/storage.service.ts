import { appConfig } from '@/common/appConfig';
import { db } from '@/common/database';
import { StorageExportResponse } from '@/shared/types/storage.type';

export const storageService = new (class StorageService {
  async import(data: StorageExportResponse) {
    const { expenses, categories, recurring, notes } = data;

    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom('expenses').execute();
      await trx.deleteFrom('recurring').execute();
      await trx.deleteFrom('categories').execute();
      await trx.deleteFrom('notes').execute();

      if (categories.length > 0) await trx.insertInto('categories').values(categories).execute();
      if (expenses.length > 0) await trx.insertInto('expenses').values(expenses).execute();
      if (recurring.length > 0) await trx.insertInto('recurring').values(recurring).execute();
      if (notes.length > 0) await trx.insertInto('notes').values(notes).execute();
    });
  }

  async export(): Promise<StorageExportResponse> {
    const version = appConfig.version;

    const [expenses, categories, recurring, notes] = await Promise.all([
      db.selectFrom('expenses').selectAll().execute(),
      db.selectFrom('categories').selectAll().execute(),
      db.selectFrom('recurring').selectAll().execute(),
      db.selectFrom('notes').selectAll().execute(),
    ]);

    return { expenses, categories, recurring, notes, version };
  }
})();
