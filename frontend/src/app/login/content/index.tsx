import { LoginForm, LoginFormInput } from '../../components/login/form/login';
import { DeviceRegisterType } from '../../components/login/form/device-register';
import { PasscodeContent } from './passcode';
import { DeviceRegisterContent } from './device-register';
import { useTransContext } from '@jellybrick/solid-i18next';
import { errorMessage, resetText } from './index.css';
import { styled } from '../../../utils';
import { Match, Show, Switch, createEffect, createResource, createSignal } from 'solid-js';
import { Response, defaultLoginForm, login } from '../../../ipc/api';

const ErrorMessage = styled('p', errorMessage);
const ResetText = styled('p', resetText);

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

  const [input, setInput] = createSignal<LoginFormInput>({
    email: '',
    password: '',
    saveId: true,
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
        saveId: form.saveEmail,
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

  async function submit(input: LoginFormInput) {
    try {
      const response = await login({
        email: input.email,
        password: input.password,
        saveEmail: input.saveId,
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
      <ErrorMessage>
        {getErrorMessage()}
      </ErrorMessage>
    </Show>
    <Show when={state().type !== DEFAULT_STATE.type}>
      <ResetText onClick={onResetClick}>{t('login.back_to_login')}</ResetText>
    </Show>
  </>;
};
