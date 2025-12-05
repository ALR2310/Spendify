import pako from 'pako';

import { appConfig } from '@/common/appConfig';
import { db } from '@/common/database';
import { StorageExportResponse, StorageGetStatusResponse, StorageSyncResponse } from '@/shared/types/storage.type';

import { googleAuthService } from './googleauth.service';
import { FileMetadata, GoogleDriveService } from './googledrive.service';

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

  async getStatus(): Promise<StorageGetStatusResponse[]> {
    const accessToken = await googleAuthService.getAccessToken();
    if (!accessToken) throw new Error('Please login to Google');

    const googleDriveService = new GoogleDriveService(accessToken);

    let cloudFile: (FileMetadata & { properties?: Record<string, string> }) | null = null;

    if (appConfig.data.fileId) {
      cloudFile = await googleDriveService.getById(appConfig.data.fileId, ['properties']).catch(() => null);
    }
    if (!cloudFile) {
      const list = await googleDriveService.getList({
        q: "name = 'spendify.gzip'",
        fields: ['properties'],
        spaces: 'appDataFolder',
      });
      cloudFile = list[0] || null;
    }

    const localData = await this.export();
    const localStr = JSON.stringify(localData);

    const results: StorageGetStatusResponse[] = [
      {
        type: 'local' as const,
        dateSync: appConfig.data.dateSync || null,
        fileLength: localStr.length,
      },
    ];

    if (cloudFile) {
      results.push({
        type: 'cloud' as const,
        dateSync: cloudFile.properties?.dateSync || null,
        fileLength: cloudFile.properties ? parseInt(cloudFile.properties.fileLength || '0', 10) : null,
      });
    }

    return results;
  }

  async uploadToCloud(googleDriveService: GoogleDriveService) {
    const data = await this.export();
    const dataStr = JSON.stringify(data);
    const compressed = pako.gzip(dataStr);
    const dateSync = new Date().toISOString();

    const fileId = await googleDriveService.upload({
      fileName: 'spendify.gzip',
      fileContent: compressed,
      mimeType: 'application/gzip',
      properties: { dateSync, fileLength: dataStr.length },
    });

    appConfig.data.fileId = fileId;
    appConfig.data.dateSync = dateSync;
    appConfig.data.firstSync = false;

    return { type: 'upload' as const, fileId };
  }

  async downloadFromCloud(googleDriveService: GoogleDriveService, file: FileMetadata) {
    const fileBlob = await googleDriveService.download(file.id);
    const arrayBuffer = await fileBlob.arrayBuffer();
    const json = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' });
    const data: StorageExportResponse = JSON.parse(json);

    await this.import(data);

    const cloudDateSync = file.properties?.dateSync || new Date().toISOString();

    appConfig.data.fileId = file.id;
    appConfig.data.dateSync = cloudDateSync;
    appConfig.data.firstSync = false;

    return { type: 'download' as const, fileId: file.id };
  }

  async sync(): Promise<StorageSyncResponse> {
    const accessToken = await googleAuthService.getAccessToken();
    if (!accessToken) throw new Error('Please login to Google to enable sync.');

    const googleDriveService = new GoogleDriveService(accessToken);

    let cloudFile: (FileMetadata & { properties?: Record<string, string> }) | null = null;

    if (appConfig.data.fileId) {
      cloudFile = await googleDriveService.getById(appConfig.data.fileId, ['properties']).catch(() => null);
    }

    if (!cloudFile) {
      const list = await googleDriveService.getList({
        q: "name = 'spendify.gzip'",
        fields: ['properties'],
        spaces: 'appDataFolder',
      });
      cloudFile = list[0] || null;
    }

    if (!cloudFile) return this.uploadToCloud(googleDriveService);

    const cloudDate = new Date(cloudFile.properties?.dateSync || 0);
    const localDate = new Date(appConfig.data.dateSync || 0);

    if (cloudDate > localDate) return this.downloadFromCloud(googleDriveService, cloudFile);
    if (cloudDate < localDate) return this.uploadToCloud(googleDriveService);

    return { type: 'noop', message: 'Already synced.' };
  }
})();
