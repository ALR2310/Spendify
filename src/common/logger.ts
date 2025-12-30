import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';

export class Logger {
  private getLogFileName() {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear());

    return `spendify-${day}-${month}-${year}.log`;
  }

  private format(level: 'log' | 'warn' | 'error', ...message: any[]): string {
    const timestamp = new Date().toISOString();

    const text = message
      .map((item) => {
        if (typeof item === 'string') return item;
        try {
          return JSON.stringify(item, null, 2);
        } catch {
          return String(item);
        }
      })
      .join(' ');

    return `[${timestamp}][${level.toUpperCase()}]: ${text}\n`;
  }

  private async write(level: 'log' | 'warn' | 'error', ...message: any[]) {
    const line = this.format(level, ...message);

    if (!Capacitor.isNativePlatform()) {
      console[level](...message);
      return;
    }

    const fileName = this.getLogFileName();

    try {
      await Filesystem.appendFile({
        path: fileName,
        data: line,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
    } catch {
      await Filesystem.writeFile({
        path: fileName,
        data: line,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
    }
  }

  log(...message: any[]) {
    this.write('log', ...message);
  }

  warn(...message: any[]) {
    this.write('warn', ...message);
  }

  error(...message: any[]) {
    this.write('error', ...message);
  }
}

export const logger = new Logger();
