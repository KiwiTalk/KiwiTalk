import { TransProvider } from '@jellybrick/solid-i18next';

import { ParentProps } from 'solid-js';
import { LangResource } from './intl';

const Provider = (props: ParentProps) => {
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

export default Provider;
