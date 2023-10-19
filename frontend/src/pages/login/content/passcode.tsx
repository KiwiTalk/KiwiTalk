import { createResource, createSignal, onMount } from 'solid-js';
import { useTransContext } from '@jellybrick/solid-i18next';

import { LoginForm, Response, registerDevice } from '@/api';
import { DeviceRegisterType } from './device-register';

import * as styles from './passcode.css';

export type PasscodeFormProp = {
  passcode?: string,
  onSubmit?: (passcode: string) => void,

  class?: string
}

export const PasscodeForm = (props: PasscodeFormProp) => {
  const [t] = useTransContext();

  function onInputHandler(text: string) {
    if (text.length === 4) {
      props.onSubmit?.(text);
    }
  }

  onMount(() => {
    if (props.passcode) {
      onInputHandler(props.passcode);
    }
  });

  return <div class={props.class}>
    <input
      type='number'
      class={styles.passcodeInput}
      maxLength={4}
      placeholder={t('login.passcode_placeholder')}
      value={props.passcode}
      onInput={(event) => onInputHandler(event.target.value)}
    />
  </div>;
};

export type PasscodeContentProp = {
  registerType: DeviceRegisterType,
  input: LoginForm,

  onSubmit?: (response: Response<void>) => void,
  onError?: (e: unknown) => void
}

export const PasscodeContent = (props: PasscodeContentProp) => {
  const [passcode, setPasscode] = createSignal<string | null>(null);

  const [data] = createResource(passcode, async (passcode) => {
    if (data.loading) return;

    try {
      const response = await registerDevice(
        passcode,
        props.input.email,
        props.input.password,
        props.registerType === 'permanent',
      );

      props.onSubmit?.(response);
    } catch (e) {
      props.onError?.(e);
    }
  });

  return <PasscodeForm onSubmit={setPasscode} />;
};
