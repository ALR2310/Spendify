import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { appConfig } from './appConfig';
import en from './locales/en.json';
import vi from './locales/vi.json';

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
