import dayjs from 'dayjs';
import pako from 'pako';

import { appConfig } from '@/common/appConfig';
import { db } from '@/common/database';
import { ExpenseTypeEnum } from '@/common/database/types/tables/expenses';
import {
  SpendingData,
  StorageExportResponse,
  StorageStatusResponse,
  StorageSyncResponse,
} from '@/shared/types/storage.type';

import { googleAuthService } from './googleauth.service';
import { FileMetadata, GoogleDriveService } from './googledrive.service';

export const storageService = new (class StorageService {
  private googleDriveService: GoogleDriveService | null = null;

  async migrateData(data: SpendingData): Promise<StorageExportResponse> {
    const dateNow = new Date().toISOString();

    const uniqueCategoryNames = new Set(data.spendingItem.filter((i) => i.status !== 0).map((i) => i.nameitem.trim()));
    const categories = [...uniqueCategoryNames].map((name, idx) => ({
      id: idx + 1,
      name,
      icon: undefined,
      color: undefined,
      createdAt: dateNow,
      updatedAt: dateNow,
    }));

    const mapNameToId = new Map(categories.map((c) => [c.name, c.id]));
    const expenses: any[] = data.spendingItem
      .filter((i) => i.status !== 0)
      .map((i) => {
        const date = dayjs(i.atupdate).toISOString();
        return {
          categoryId: mapNameToId.get(i.nameitem.trim()) as number,
          amount: i.price,
          note: i.details && i.details.trim() !== 'Không có thông tin' ? i.details.trim() : null,
          date: date,
          createdAt: date,
          updatedAt: date,
          type: ExpenseTypeEnum.Expense,
        };
      });

    const notes: any[] = data.noted
      .filter((n) => n.status !== 0)
      .map((n) => {
        const date = dayjs(n.atupdate).toISOString();
        return {
          title: n.namelist?.trim() || 'Không tiêu đề',
          content: n.content?.trim() || '',
          createdAt: date,
          updatedAt: date,
        };
      });

    return {
      expenses: expenses ?? [],
      categories: categories ?? [],
      recurring: [],
      notes: notes ?? [],
      version: appConfig.version,
    };
  }

  async import(data: StorageExportResponse) {
    if ((data as any).spendingList) data = await this.migrateData(data as any);

    if (!this.validateData(data)) {
      throw new Error('Invalid file format. Please check the file structure.');
    }

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

  async status(): Promise<StorageStatusResponse> {
    const cloudFile = await this.findCloudFile();

    const localData = await this.export();
    const localStr = JSON.stringify(localData);

    return {
      local: {
        exists: true,
        dateSync: appConfig.data.dateSync || null,
        fileLength: localStr.length,
      },
      cloud: {
        exists: !!cloudFile,
        dateSync: cloudFile?.properties?.dateSync || null,
        fileLength: cloudFile ? parseInt(cloudFile?.properties?.fileLength || '0', 10) : null,
        fileId: cloudFile?.id || null,
      },
    };
  }

  async download(): Promise<void> {
    const googleDriveService = await this.getDriveService();
    const cloudFile = await this.findCloudFile();

    if (!cloudFile) throw new Error('No cloud file found');

    const fileBlob = await googleDriveService.download(cloudFile.id);
    const arrayBuffer = await fileBlob.arrayBuffer();
    const json = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' });
    const data: StorageExportResponse = JSON.parse(json);

    await this.import(data);

    appConfig.data.fileId = cloudFile.id;
    appConfig.data.dateSync = cloudFile.properties?.dateSync || new Date().toISOString();
    appConfig.data.firstSync = false;
  }

  async upload(): Promise<void> {
    const googleDriveService = await this.getDriveService();

    try {
      const existingFiles = await googleDriveService.getList({
        q: "name = 'spendify.gzip'",
        spaces: 'appDataFolder',
      });

      await Promise.all(existingFiles.map((file) => googleDriveService.delete(file.id)));
    } catch (error) {
      console.warn('Failed to delete existing files:', error);
    }

    const data = await this.export();
    const dataStr = JSON.stringify(data);
    const compressed = pako.gzip(dataStr);
    const dateSync = new Date().toISOString();

    const fileId = await googleDriveService.upload({
      fileName: 'spendify.gzip',
      fileContent: compressed,
      mimeType: 'application/gzip',
      properties: { dateSync, fileLength: dataStr.length },
      parents: ['appDataFolder'],
    });

    appConfig.data.fileId = fileId;
    appConfig.data.dateSync = dateSync;
    appConfig.data.firstSync = false;
  }

  async sync(): Promise<StorageSyncResponse> {
    const status = await this.status();
    const { local, cloud } = status;

    const cloudDate = new Date(cloud.dateSync || 0);
    const localDate = new Date(local.dateSync || 0);

    if (localDate >= cloudDate) {
      await this.upload();
      return { type: 'upload', fileId: appConfig.data.fileId };
    } else {
      await this.download();
      return { type: 'download', fileId: cloud.fileId || '' };
    }
  }

  private validateData(data: any): data is StorageExportResponse {
    if (!data || typeof data !== 'object') return false;
    if (!Array.isArray(data.expenses)) return false;
    if (!Array.isArray(data.categories)) return false;
    if (!Array.isArray(data.recurring)) return false;
    if (!Array.isArray(data.notes)) return false;
    if (!data.version || typeof data.version !== 'string') return false;
    return true;
  }

  private async getDriveService(): Promise<GoogleDriveService> {
    const accessToken = await googleAuthService.getAccessToken();
    if (!accessToken) throw new Error('Please login to Google');
    if (this.googleDriveService) return this.googleDriveService;
    return (this.googleDriveService = new GoogleDriveService(accessToken));
  }

  private async findCloudFile(): Promise<(FileMetadata & { properties?: Record<string, string> }) | null> {
    const driveService = await this.getDriveService();

    if (appConfig.data.fileId) {
      const file = await driveService.getById(appConfig.data.fileId, ['properties']).catch(() => null);
      if (file) return file;
    }

    const list = await driveService.getList({
      q: "name = 'spendify.gzip'",
      fields: ['properties'],
      spaces: 'appDataFolder',
    });

    return list[0] || null;
  }
})();
