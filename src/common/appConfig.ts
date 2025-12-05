import { Preferences } from '@capacitor/preferences';

import { LanguageEnum, ThemeEnum } from '@/shared/enums/appconfig.enum';

interface AppConfig {
  theme: ThemeEnum;
  language: LanguageEnum;
  autoUpdate: boolean;
  data: {
    fileId: string | null;
    dateSync: string | null;
    firstSync: boolean;
  };
  version: string;
}

const defaultConfig: AppConfig = {
  theme: ThemeEnum.SYSTEM,
  language: LanguageEnum.EN,
  autoUpdate: true,
  data: {
    fileId: null,
    dateSync: null,
    firstSync: true,
  },
  version: import.meta.env.VITE_APP_VERSION,
};

const STORAGE_KEY = 'appConfig';

const deepClone = <T>(obj: T): T => structuredClone(obj);

function deepMerge(target: any, source: any) {
  for (const key of Object.keys(source)) {
    const sVal = source[key];
    const tVal = target[key];

    if (sVal && typeof sVal === 'object' && !Array.isArray(sVal)) {
      if (!tVal || typeof tVal !== 'object' || Array.isArray(tVal)) {
        target[key] = {};
      }
      deepMerge(target[key], sVal);
    } else if (!(key in target)) {
      target[key] = sVal;
    }
  }
}

function deepRemoveUnknown(target: any, source: any) {
  for (const key of Object.keys(target)) {
    if (!(key in source)) {
      delete target[key];
      continue;
    }

    const tVal = target[key];
    const sVal = source[key];

    if (
      tVal &&
      typeof tVal === 'object' &&
      sVal &&
      typeof sVal === 'object' &&
      !Array.isArray(tVal) &&
      !Array.isArray(sVal)
    ) {
      deepRemoveUnknown(tVal, sVal);
    }
  }
}

async function save(config: AppConfig) {
  await Preferences.set({
    key: STORAGE_KEY,
    value: JSON.stringify(config),
  });
}

function createProxy(root: AppConfig): AppConfig {
  const cache = new WeakMap<object, any>();

  const handler: ProxyHandler<any> = {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (cache.has(value)) return cache.get(value);

        const child = new Proxy(value, handler);
        cache.set(value, child);
        return child;
      }

      return value;
    },

    set(target, prop, value, receiver) {
      const result = Reflect.set(target, prop, value, receiver);
      Promise.resolve().then(() => save(root));
      return result;
    },

    deleteProperty(target, prop) {
      const ok = Reflect.deleteProperty(target, prop);
      if (ok) Promise.resolve().then(() => save(root));
      return ok;
    },
  };

  const proxyRoot = new Proxy(root, handler);
  cache.set(root, proxyRoot);
  return proxyRoot;
}

export async function initAppConfig(): Promise<AppConfig> {
  const pref = await Preferences.get({ key: STORAGE_KEY });
  let config: AppConfig;

  if (!pref.value) {
    config = deepClone(defaultConfig);
  } else {
    try {
      config = JSON.parse(pref.value) as AppConfig;
    } catch {
      config = deepClone(defaultConfig);
    }

    deepMerge(config, defaultConfig);
    deepRemoveUnknown(config, defaultConfig);
    config.version = defaultConfig.version;
  }

  await save(config);

  return createProxy(config);
}

export const appConfig = await initAppConfig();
