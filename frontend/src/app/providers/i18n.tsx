import { TransProvider } from '@jellybrick/solid-i18next';
import { ParentProps } from 'solid-js';
import { LangResource } from '../intl';

const I18nProvider = (props: ParentProps) => {
  return (
    <TransProvider
      options={{
        resources: LangResource,
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
};

export default I18nProvider;
