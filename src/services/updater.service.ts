import { Capacitor, CapacitorHttp, PluginListenerHandle } from '@capacitor/core';
import { FileTransfer } from '@capacitor/file-transfer';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@capawesome-team/capacitor-file-opener';
import { CapacitorDevice } from 'capacitor-device';
import semver from 'semver';

import pkg from '@/../package.json' with { type: 'json' };
import { Emitter } from '@/common/emitter';
import { logger } from '@/common/logger';
import { CheckForUpdatesResponse, UpdaterEvents } from '@/common/types/updater.type';

export const updaterService = new (class UpdaterService {
  private gitUrl = `https://api.github.com/repos/${import.meta.env.VITE_GIT_REPO}`;
  private cachedCheckForUpdates: CheckForUpdatesResponse | null = null;
  private lastCheckTime: number = 0;
  private readonly CACHE_DURATION = 60 * 1000; // 1 minute in milliseconds

  async checkForUpdates(): Promise<CheckForUpdatesResponse> {
    const now = Date.now();
    if (this.cachedCheckForUpdates?.hasUpdate && now - this.lastCheckTime < this.CACHE_DURATION) {
      return this.cachedCheckForUpdates;
    }
    const latestResponse = await this.getLatest();
    if (!latestResponse || !latestResponse.tag_name || !latestResponse.assets.length) {
      return { hasUpdate: false };
    }

    try {
      const currentVersion = pkg.version;
      const latestVersion = latestResponse.tag_name.replace(/^v/, '');

      if (semver.gt(latestVersion, currentVersion)) {
        this.cachedCheckForUpdates = { hasUpdate: true, assets: latestResponse.assets };
        this.lastCheckTime = Date.now();
        return this.cachedCheckForUpdates;
      }
    } catch (error) {
      console.error('Error comparing versions:', error);
    }

    return { hasUpdate: false };
  }

  download() {
    const emitter = new Emitter<UpdaterEvents>();
    let listener: PluginListenerHandle | null = null;

    (async () => {
      try {
        const { assets } = await this.checkForUpdates();

        if (!assets || assets.length === 0) {
          logger.log('No assets available for download.');
          emitter.emit('error', new Error('No assets available for download.'));
          return;
        }

        const deviceInfo = await CapacitorDevice.getInfo();

        let asset = assets.find((a) => a.name.includes(deviceInfo.arch));
        if (!asset) asset = assets.find((a) => a.name.includes('.apk'));
        if (!asset) {
          logger.log('No suitable asset found for download.');
          emitter.emit('error', new Error('No suitable asset found for download.'));
          return;
        }

        const downloadUrl = asset.browser_download_url;

        if (Capacitor.isNativePlatform()) {
          const pathSave = await this.getFileUri(asset.name, 'Download');
          const isExists = await this.isFileExists(asset.name, 'Download', asset.size);

          if (isExists) {
            emitter.emit('complete', { message: 'File already exists', path: pathSave });
            return;
          }

          listener = await FileTransfer.addListener('progress', (progress) => {
            const { bytes, contentLength } = progress;
            const percentage = (bytes / contentLength) * 100;

            emitter.emit('progress', percentage);
            if (percentage >= 100) {
              emitter.emit('complete', {
                message: 'Download completed',
                path: pathSave,
              });
              listener?.remove();
            }
          });

          FileTransfer.downloadFile({
            url: downloadUrl,
            path: pathSave,
            progress: true,
          });
        } else {
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = asset.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          emitter.emit('complete', { message: 'Download started' });
        }
      } catch (error) {
        logger.error('Error in download:', error);
        emitter.emit('error', error as Error);
        listener?.remove();
      }
    })();

    return emitter;
  }

  async install(filePath: string) {
    try {
      await FileOpener.openFile({
        path: filePath,
        mimeType: 'application/vnd.android.package-archive',
      });
    } catch (error) {
      logger.error('Error during installation:', error);
      throw new Error('Installation failed');
    }
  }

  downloadAndInstall() {
    const emitter = new Emitter<UpdaterEvents>();

    (async () => {
      try {
        const check = await this.checkForUpdates();

        if (!check.hasUpdate) {
          emitter.emit('complete', { message: 'No update available' });
          setTimeout(() => emitter.destroy(), 100);
          return;
        }

        const downloadEmitter = this.download();

        downloadEmitter
          .on('progress', (progress) => {
            emitter.emit('progress', progress);
          })
          .on('error', (error) => {
            emitter.emit('error', error);
          })
          .on('complete', async (result) => {
            emitter.emit('complete', result);
            if (!result?.path || !Capacitor.isNativePlatform()) return;
            await this.install(result.path).catch((err) => {
              emitter.emit('error', err);
            });
          });
      } catch (error) {
        logger.error('Error in downloadAndInstall:', error);
        emitter.emit('error', error as Error);
        setTimeout(() => emitter.destroy(), 100);
      }
    })();

    return emitter;
  }

  private async getLatest(): Promise<Record<string, any> | null> {
    try {
      let latestResponse = await CapacitorHttp.get({
        url: `${this.gitUrl}/releases/latest`,
        headers: {
          Authorization: `token ${import.meta.env.VITE_GIT_PAT}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (latestResponse.status === 400) {
        latestResponse = await CapacitorHttp.get({
          url: `${this.gitUrl}/releases?per_page=1`,
        });
      }

      return latestResponse.data;
    } catch (error) {
      console.error('Error fetching latest release:', error);
      return null;
    }
  }

  private async getFileUri(filePath: string, directory: Directory | 'Download' = Directory.Cache) {
    if (directory !== 'Download') {
      const result = await Filesystem.getUri({ directory, path: filePath });
      return result.uri;
    }
    const result = await Filesystem.getUri({ directory: Directory.Documents, path: filePath });
    return result.uri.replace('Documents', 'Download');
  }

  private async isFileExists(
    filePath: string,
    directory: Directory | 'Download' = Directory.Cache,
    fileSize?: number,
  ) {
    try {
      if (directory === 'Download') {
        filePath = `../${directory}/${filePath}`;
        directory = Directory.Documents;
      }
      const result = await Filesystem.stat({ directory, path: filePath });

      if (fileSize && result.size !== fileSize) {
        return false;
      }

      return true;
    } catch (err) {
      logger.log('File does not exist:', filePath);
      return false;
    }
  }
})();
