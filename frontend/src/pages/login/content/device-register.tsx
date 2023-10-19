import { createResource, createSignal } from 'solid-js';
import { useTransContext } from '@jellybrick/solid-i18next';

import { Response, requestPasscode, LoginForm } from '@/api';

import * as styles from './device-register.css';

export type DeviceRegisterType = 'permanent' | 'temporary';

export type DeviceRegisterFormProp = {
  onSubmit?: (type: DeviceRegisterType) => void,

  class?: string
}

export type DeviceRegisterContentProp = {
  input: LoginForm,

  onSubmit?: (response: Response<void>, type: DeviceRegisterType) => void,
  onError?: (e: unknown) => void
}

export const DeviceRegisterContent = (props: DeviceRegisterContentProp) => {
  const [t] = useTransContext();

  const [type, setType] = createSignal<DeviceRegisterType | null>(null);

  const [data] = createResource(type, async (type) => {
    if (data.loading) return;

    try {
      props.onSubmit?.(await requestPasscode(props.input.email, props.input.password), type);
    } catch (e) {
      props.onError?.(e);
    }
  });

  return (
    <div>
      <button class={styles.registerButton} onClick={() => setType('permanent')}>
        {t('login.register_type.permanent')}
      </button>
      <div class={styles.buttonDivider} />
      <button class={styles.registerButton} onClick={() => setType('temporary')}>
        {t('login.register_type.temporary')}
      </button>
    </div>
  );
};
