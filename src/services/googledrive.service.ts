import { CapacitorHttp } from '@capacitor/core';

interface UploadOptions {
  fileName: string;
  fileContent: Blob;
  mimeType?: string;
  parents?: string[];
  properties?: Record<string, string | number | boolean>;
  appProperties?: Record<string, string | number | boolean>;
}

interface FileMetadata {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  modifiedTime: string;
  [key: string]: any;
}

interface GetAllOptions<F extends string = string> {
  q?: string;
  fields?: F[];
  spaces?: 'drive' | 'appDataFolder';
  orderBy?: string;
  pageSize?: number;
  pageToken?: string;
}

export class GoogleDriveService {
  constructor(private accessToken: string) {}

  private readonly API_URL = 'https://www.googleapis.com/drive/v3';
  private readonly UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
  private readonly defaultFields = ['id', 'name', 'size', 'mimeType', 'modifiedTime'];

  async upload(options: UploadOptions) {
    const { fileName, fileContent, mimeType, parents, properties, appProperties } = options;

    const metadata = {
      name: fileName,
      mimeType: mimeType || 'application/octet-stream',
      ...(parents?.length ? { parents } : {}),
      ...(properties ? { properties } : {}),
      ...(appProperties ? { appProperties } : {}),
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', fileContent, fileName);

    const response = await CapacitorHttp.post({
      url: `${this.UPLOAD_URL}?uploadType=multipart`,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      data: form,
    });

    if (response.status !== 200) {
      throw new Error(`File upload failed: ${response.status} ${response.data?.error?.message || ''}`);
    }

    return response.data.id;
  }

  async download(fileId: string) {
    const response = await fetch(`${this.API_URL}/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`File download failed: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const blob = new Blob([buffer]);
    return blob;
  }

  async delete(fileId: string) {
    const response = await CapacitorHttp.delete({
      url: `${this.API_URL}/files/${fileId}`,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (response.status !== 204) {
      throw new Error(`File deletion failed: ${response.status} ${response.data?.error?.message || ''}`);
    }
  }

  async getAll<F extends string = never>(options: GetAllOptions<F>) {
    const { q, fields, spaces = 'drive', orderBy, pageSize, pageToken } = options;

    const fieldsQuery = Array.from(new Set([...this.defaultFields, ...(fields ?? [])])).join(',');

    const params = new URLSearchParams({
      ...(q ? { q } : {}),
      ...(spaces ? { spaces } : {}),
      ...(orderBy ? { orderBy } : {}),
      ...(pageSize ? { pageSize: pageSize.toString() } : {}),
      ...(pageToken ? { pageToken } : {}),
      fields: `files(${fieldsQuery})`,
    });

    const response = await CapacitorHttp.get({
      url: `${this.API_URL}/files?${params.toString()}`,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (response.status !== 200) {
      throw new Error(`Failed to get files: ${response.status} ${response.data?.error?.message || ''}`);
    }

    return response.data.files as Array<FileMetadata & Record<F, any>>;
  }

  async getById<F extends string = never>(id: string, fields: F[]) {
    const fieldsQuery = Array.from(new Set([...this.defaultFields, ...fields])).join(',');

    const params = new URLSearchParams({
      fields: fieldsQuery,
    });

    const response = await CapacitorHttp.get({
      url: `${this.API_URL}/files/${id}?${params.toString()}`,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (response.status !== 200) {
      throw new Error(`Failed to get file by ID: ${response.status} ${response.data?.error?.message || ''}`);
    }

    return response.data as FileMetadata & Record<F, any>;
  }
}
