import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/assets/locales/en.json';
import vi from '@/assets/locales/vi.json';

import { appConfig } from './appConfig';

const language = appConfig.language;

i18n.use(initReactI18next).init({
  lng: language,
  fallbackLng: 'vi',
  resources: {
    en: { translation: en },
    vi: { translation: vi },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
