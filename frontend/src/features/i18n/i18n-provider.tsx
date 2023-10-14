import { TransProvider } from '@jellybrick/solid-i18next';
import { ParentProps } from 'solid-js';

import { I18nResource } from './i18n-resource';

export const I18nProvider = (props: ParentProps) => (
  <TransProvider
    options={{
      resources: I18nResource,
      debug: import.meta.env.DEV,
      fallbackLng: 'ko-KR',
      interpolation: {
        escapeValue: false,
      },
    }}
  >
    {props.children}
  </TransProvider>
);
