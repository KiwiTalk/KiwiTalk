import type { Resource } from 'i18next';

import enUS from './translations/en-US.json';
import koKR from './translations/ko-KR.json';

export const LangResource: Resource = {
  en: {
    translation: enUS,
  },
  ko: {
    translation: koKR,
  },
};
