import { useLocation, useNavigate } from '@solidjs/router';
import { Trans, useTransContext } from '@jellybrick/solid-i18next';
import { createSignal, createResource, Show, createEffect } from 'solid-js';

import { Button } from '@/ui-common/button';
import { registerDevice, requestPasscode } from '@/api';

import * as styles from './page.css';

import { ErrorTip } from '../_components/error-tip';
import { Passcode } from './_components/passcode';

export const DeviceRegisterPage = () => {
  const [t] = useTransContext();
  const navigate = useNavigate();
  const location = useLocation<{ email?: string; password?: string; }>();
  const input = () => location.state;

  const [type, setType] = createSignal<'permanent' | 'temporary' | null>(null);
  const [passcode, setPasscode] = createSignal<string | null>(null);

  const [passcodeResponse] = createResource(type, async () => {
    if (passcodeResponse.loading) return;

    const data = input();
    if (!data?.email || !data?.password) throw t('login.required_id_password');

    const response = await requestPasscode(data.email, data.password);
    if (response.type === 'Success') return true;
    if (response.type === 'Failure') {
      throw t(`login.status.passcode.${response.content}`);
    }

    return false;
  });

  const [deviceResponse] = createResource(passcode, async (code) => {
    if (deviceResponse.loading) return;

    const data = input();
    if (!data?.email || !data?.password) throw t('login.required_id_password');

    const response = await registerDevice(
      code,
      data.email,
      data.password,
      type() === 'permanent',
    );

    if (response.type === 'Success') return true;
    if (response.type === 'Failure') {
      throw t(`login.status.device_register.${response.content}`);
    }

    return false;
  });

  createEffect(() => {
    if (deviceResponse()) {
      navigate('/login/end', {
        state: {
          email: input()?.email,
          password: input()?.password,
        },
      });
    }
  });

  return (
    <div class={styles.container}>
      <Show when={passcodeResponse.state === 'unresolved'}>
        <div class={styles.tool}>
          <Button variant={'text'} onClick={() => setType('temporary')}>
            <Trans key={'login.register_type.temporary'} />
          </Button>
          <Button onClick={() => setType('permanent')}>
            <Trans key={'login.register_type.permanent'} />
          </Button>
        </div>
      </Show>
      <ErrorTip message={passcodeResponse.error?.toString()} />
      <ErrorTip message={deviceResponse.error?.toString()} />
      <Show when={passcodeResponse.state !== 'unresolved'}>
        <Passcode onSubmit={setPasscode} />
      </Show>
    </div>
  );
};
