import 'dotenv/config';

import path from 'path';
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.alr.spendify',
  appName: 'Spendify',
  webDir: 'dist',
  server: {
    allowNavigation: ['accounts.google.com', '*.googleusercontent.com'],
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
    },
    SplashScreen: {
      launchShowDuration: 0,
    },
    CapacitorHttp: {
      enabled: true,
    },
    CapacitorSQLite: {
      androidIsEncryption: true,
      androidBiometric: {
        biometricAuth: false,
        biometricTitle: 'Biometric login for capacitor sqlite',
        biometricSubTitle: 'Log in using your biometric',
        androidDatabaseLocation: 'default',
      },
    },
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
    buildOptions: {
      keystorePath: path.resolve(__dirname, 'spendify-key.jks'),
      keystoreAlias: process.env.ANDROID_KEYSTORE_ALIAS,
      keystorePassword: process.env.ANDROID_KEYSTORE_PASSWORD,
      releaseType: 'APK',
      signingType: 'apksigner',
    },
  },
};

export default config;
