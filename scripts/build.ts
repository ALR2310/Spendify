import 'dotenv/config';

import { execSync } from 'child_process';
import { existsSync, readdirSync, unlinkSync, writeFileSync } from 'fs';
import capitalize from 'lodash/capitalize';
import path from 'path';
import { build } from 'vite';

import pkg from '../package.json' with { type: 'json' };

console.table(process.env);

const APK_DIR = path.resolve('android', 'app', 'build', 'outputs', 'apk', 'release');
const KEYSTORE_PATH = path.resolve('spendify-key.jks');

function decodeKeystoreFromEnv() {
  const base64 = process.env.ANDROID_KEYSTORE_BASE64;
  if (!base64) {
    throw new Error('Missing ANDROID_KEYSTORE_BASE64');
  }

  const buffer = Buffer.from(base64, 'base64');
  writeFileSync(KEYSTORE_PATH, buffer);
}

function resolveOutputName(apk: string) {
  const version = pkg.version;

  const appName = capitalize(pkg.name);

  if (apk.includes('universal')) return `${appName}-${version}.apk`;
  if (apk.includes('arm64-v8a')) return `${appName}-arm64-v8a-${version}.apk`;
  if (apk.includes('armeabi-v7a')) return `${appName}-armeabi-v7a-${version}.apk`;

  // fallback
  return apk.replace('-unsigned.apk', '-signed.apk');
}

(async () => {
  try {
    console.log('🔧 Building Vite...');
    await build({
      configFile: './vite.config.ts',
      mode: 'production',
      build: {
        sourcemap: false,
        minify: true,
        cssMinify: true,
      },
    });

    console.log('🔄 Syncing Capacitor...');
    execSync('npx cap sync android', {
      stdio: 'inherit',
    });

    console.log('🤖 Building Android APKs...');
    execSync('cd android && ./gradlew assembleRelease', {
      stdio: 'inherit',
    });

    const isDev = process.env.NODE_ENV === 'development';
    const keyStoreAlias = process.env.ANDROID_KEYSTORE_ALIAS;
    const keyStorePassword = process.env.ANDROID_KEYSTORE_PASSWORD;

    if (!keyStoreAlias || !keyStorePassword) {
      throw new Error('Missing ANDROID_KEYSTORE_ALIAS or ANDROID_KEYSTORE_PASSWORD');
    }

    console.log('🔐 Restoring keystore from ENV...');
    if (!isDev) decodeKeystoreFromEnv();

    if (!existsSync(APK_DIR)) {
      throw new Error(`APK directory not found: ${APK_DIR}`);
    }

    const apkFiles = readdirSync(APK_DIR).filter((file) => file.endsWith('.apk') && file.includes('unsigned'));

    if (apkFiles.length === 0) {
      return console.warn('⚠️ No unsigned APK files found.');
    }

    await Promise.all(
      apkFiles.map((apk) =>
        Promise.resolve().then(() => {
          const inputApk = path.join(APK_DIR, apk);
          const outputName = resolveOutputName(apk);
          const outputApk = path.join(APK_DIR, outputName);

          console.log(`✍️ Signing: ${apk} → ${outputName}`);

          execSync(
            `apksigner sign \
              --ks "${KEYSTORE_PATH}" \
              --ks-pass pass:${keyStorePassword} \
              --ks-key-alias ${keyStoreAlias} \
              --out "${outputApk}" \
              "${inputApk}"`,
            { stdio: 'inherit' },
          );

          try {
            unlinkSync(inputApk);
            console.log(`🗑️  Deleted: ${apk}`);
          } catch (err) {
            console.warn(`⚠️  Failed to delete ${apk}:`, err);
          }
        }),
      ),
    );

    console.log('🎉 All APKs signed & renamed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
})();
