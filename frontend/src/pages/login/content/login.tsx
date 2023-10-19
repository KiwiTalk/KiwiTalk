
import { Match, Show, Switch, createEffect, createResource, createSignal } from 'solid-js';
import { useTransContext } from '@jellybrick/solid-i18next';

import { LoginForm as LoginFormType, Response, defaultLoginForm, login } from '@/api';

import { PasscodeContent } from './passcode';
import { DeviceRegisterContent, DeviceRegisterType } from './device-register';

import * as styles from './login.css';

import { JSX } from 'solid-js/jsx-runtime';

export type LoginFormProp = {
  input?: Partial<LoginFormType>,
  onSubmit?: (input: LoginFormType) => void,

  class?: string
}

export const LoginForm = (props: LoginFormProp) => {
  const [t] = useTransContext();

  const submitHandler: JSX.EventHandlerUnion<HTMLFormElement, Event> = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const input: LoginFormType = {
      email: formData.get('email')?.valueOf() as string ?? '',
      password: formData.get('password')?.valueOf() as string ?? '',
      saveEmail: !!formData.get('save_id')?.valueOf(),
      autoLogin: !!formData.get('auto_login')?.valueOf(),
    };

    if (input.email === '' || input.password === '') return;

    props.onSubmit?.(input);
  };

  return <form class={props.class} onSubmit={submitHandler}>
    <input
      name='email'
      class={styles.loginInput}
      placeholder={t('login.id_placeholder')}
      value={props.input?.email}
    />
    <input
      name='password'
      type='password'
      class={styles.loginInput}
      placeholder={t('login.password_placeholder')}
      value={props.input?.password}
    />
    <button class={styles.loginButton}>{t('login.login')}</button>
    <input
      type='checkbox'
      id='save_id'
      name='save_id'
      class={styles.loginCheckbox}
      checked={props.input?.saveEmail}
    />
    <label for='save_id'>
      {props.input?.saveEmail ? '✅' : '□'}
      {t('login.save_id')}
    </label>
    <input
      type='checkbox'
      id='auto_login'
      name='auto_login'
      class={styles.loginCheckbox}
      checked={props.input?.autoLogin}
    />
    <label for={'auto_login'}>
      {props.input?.autoLogin ? '✅' : '□'}
      {t('login.auto_login_on_launch')}
    </label>
  </form>;
};

export type LoginContentProp = {
  errorMessage?: string,
  onLogin?: () => void
};

type LoginStateKey<T> = {
  type: T
};

type LoginStateDefault = LoginStateKey<'login'>;

type LoginStateDeviceRegister = LoginStateKey<'device_register'>;

type LoginStatePasscode = LoginStateKey<'passcode'> & {
  registerType: DeviceRegisterType
};

type LoginState = LoginStateDefault | LoginStateDeviceRegister | LoginStatePasscode;

const DEFAULT_STATE: LoginStateDefault = { type: 'login' };

export const AppLoginContent = (props: LoginContentProp) => {
  const [t] = useTransContext();

  const [forced, setForced] = createSignal(false);

  const [input, setInput] = createSignal<LoginFormType>({
    email: '',
    password: '',
    saveEmail: true,
    autoLogin: false,
  });

  const [state, setState] = createSignal<LoginState>(DEFAULT_STATE);

  const [errorMessage, setErrorMessage] = createSignal<string>();

  createEffect(() => {
    setErrorMessage(props.errorMessage);
  });

  createResource(async () => {
    const form = await defaultLoginForm();

    if (form) {
      setInput({
        email: form.email,
        password: form.password,
        saveEmail: form.saveEmail,
        autoLogin: form.autoLogin,
      });
    }
  });

  function onRegisterTypeSelected(response: Response<void>, type: DeviceRegisterType) {
    if (response.type === 'Success') {
      setState({ type: 'passcode', registerType: type });
      return;
    }

    setErrorMessage(t(`login.status.device_register.${response.content}`));
  }

  function onPasscodeSubmit(response: Response<void>) {
    if (response.type === 'Success') {
      setState(DEFAULT_STATE);
      submit(input());
      return;
    }

    setErrorMessage(t(`login.status.passcode.${response.content}`));
  }

  function onError(err: unknown) {
    console.error(err);
    setErrorMessage(t(`login.generic_error`));
  }

  function onResetClick() {
    setState(DEFAULT_STATE);
  }

  function getErrorMessage() {
    let currentMessage = errorMessage();
    if (currentMessage == null) {
      return '';
    }

    if (forced()) {
      currentMessage += ` ${t('login.set_forced')}`;
    }

    return currentMessage;
  }

  async function submit(input: LoginFormType) {
    try {
      const response = await login({
        email: input.email,
        password: input.password,
        saveEmail: input.saveEmail,
        autoLogin: input.autoLogin,
      }, forced());

      if (response.type === 'Success') {
        props.onLogin?.();
        return;
      }

      switch (response.content) {
      case -100: {
        setState({ type: 'device_register' });
        return;
      }

      case -101: {
        setForced(true);
        break;
      }
      }

      setErrorMessage(t(`login.status.login.${response.content}`));
    } catch (e) {
      setErrorMessage(t(`login.generic_error`));
      console.error(e);
    }
  }

  return <>
    <Switch>
      <Match when={state().type === 'login'}>
        <LoginForm input={input()} onSubmit={(input) => {
          setInput(input);
          submit(input);
        }} />
      </Match>
      <Match when={state().type === 'device_register'}>
        <DeviceRegisterContent
          input={input()}
          onSubmit={onRegisterTypeSelected}
          onError={onError}
        />
      </Match>
      <Match when={state().type === 'passcode'}>
        <PasscodeContent
          registerType={(state() as LoginStatePasscode).registerType}
          input={input()}
          onSubmit={onPasscodeSubmit}
          onError={onError}
        />
      </Match>
    </Switch>
    <Show when={errorMessage()}>
      <p class={styles.errorMessage}>
        {getErrorMessage()}
      </p>
    </Show>
    <Show when={state().type !== DEFAULT_STATE.type}>
      <p class={styles.resetText} onClick={onResetClick}>
        {t('login.back_to_login')}
      </p>
    </Show>
  </>;
};
