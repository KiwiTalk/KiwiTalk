import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LangResource } from './intl';

i18next.use(initReactI18next).init({
  resources: LangResource,
  debug: import.meta.env.DEV,
  fallbackLng: 'en',

  interpolation: {
    escapeValue: false,
  },
});
