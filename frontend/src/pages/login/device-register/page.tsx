import { createSignal, createResource } from 'solid-js';
import { Trans } from '@jellybrick/solid-i18next';
import { useRouteData } from '@solidjs/router';

import { requestPasscode } from '@/api';
import { Button } from '@/ui-common/button';

import * as styles from './page.css';

export const DeviceRegisterPage = () => {
  const input = useRouteData<{ email: string; password: string; }>();
  const [type, setType] = createSignal<'permanent' | 'temporary' | null>(null);

  const [data] = createResource(type, async (type) => {
    if (data.loading) return;

    try {
      // props.onSubmit?.(await requestPasscode(input.email, input.password), type);
    } catch (e) {
      // props.onError?.(e);
    }
  });

  return (
    <div class={styles.container}>
      <div class={styles.tool}>
        <Button variant={'text'}>
          <Trans key={'login.register_type.temporary'} />
        </Button>
        <Button>
          <Trans key={'login.register_type.permanent'} />
        </Button>
      </div>
    </div>
  );
};
