import { LoginFormInput } from '../../components/login/form/login';
import { DeviceRegisterType } from '../../components/login/form/device-register';
import { PasscodeContent } from './passcode';
import { DeviceRegisterContent } from './device-register';
import { LoginContent } from './login';
import { useTransContext } from '@jellybrick/solid-i18next';
import { errorMessage, resetText } from './index.css';
import { styled } from '../../../utils';
import { Match, Show, Switch, createResource, createSignal } from 'solid-js';
import { defaultLoginForm, takeLoginReason } from '../../../ipc/client';

const ErrorMessage = styled('p', errorMessage);
const ResetText = styled('p', resetText);

export type LoginContentProp = {
  onLogin?: () => void
};

type LoginStateKey<T> = {
  type: T,

  errorMessage?: string,
};

type LoginStateDefault = LoginStateKey<'login'> & {
  forced: boolean
};

type LoginStateDeviceRegister = LoginStateKey<'device_register'>;

type LoginStatePasscode = LoginStateKey<'passcode'> & {
  registerType: DeviceRegisterType
};

type LoginState = LoginStateDefault | LoginStateDeviceRegister | LoginStatePasscode;

const DEFAULT_STATE: LoginState = { type: 'login', forced: false };

export const AppLoginContent = (props: LoginContentProp) => {
  const [t] = useTransContext();

  const [input, setInput] = createSignal({
    email: '',
    password: '',
    saveId: true,
    autoLogin: false,
  });

  const [state, setState] = createSignal<LoginState>(DEFAULT_STATE);

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

    const reason = await takeLoginReason();
    if (!reason) {
      return;
    }

    let errorMessage: string;
    switch (reason.type) {
      case 'AutoLoginFailed': {
        const error = reason.content;
        switch (error.type) {
          case 'InvalidFile': {
            errorMessage = 'login.reason.auto_login_failed.file_read';
            break;
          }

          case 'Status': {
            errorMessage = `login.status.login.${error.content}`;
            break;
          }

          default: {
            errorMessage = 'login.reason.auto_login_failed.general';
            break;
          }
        }

        break;
      }

      case 'Kickout': {
        errorMessage = 'login.reason.kickout';
        break;
      }

      default: return;
    }

    setState({ errorMessage, ...state() });
  });

  function onLoginSubmit(input: LoginFormInput, status: number) {
    switch (status) {
      case 0: {
        props.onLogin?.();
        return;
      }

      case -100: {
        setState({ type: 'device_register' });
        return;
      }

      case -101: {
        setState({ type: 'login', forced: true });
        break;
      }
    }

    setInput(input);
    setState({ ...state(), errorMessage: `login.status.login.${status}` });
  }

  function onRegisterTypeSelected(status: number, type: DeviceRegisterType) {
    if (status === 0) {
      setState({ type: 'passcode', registerType: type });
      return;
    }

    setState({ ...state(), errorMessage: `login.status.device_register.${status}` });
  }

  function onPasscodeSubmit(status: number) {
    if (status === 0) {
      setState(DEFAULT_STATE);
      return;
    }

    setState({ ...state(), errorMessage: `login.status.passcode.${status}` });
  }

  function onError(err: unknown) {
    console.error(err);
    setState({ ...state(), errorMessage: `login.network_error` });
  }

  function onResetClick() {
    setState(DEFAULT_STATE);
  }

  function getErrorMessage() {
    const currentState = state();
    if (currentState.errorMessage == null) {
      return '';
    }

    let errorMessage = t(currentState.errorMessage);
    if (currentState.type === 'login' && currentState.forced) {
      errorMessage += ` ${t('login.set_forced')}`;
    }

    return errorMessage;
  }

  return <>
    <Switch>
      <Match when={state().type === 'login'}>
        <LoginContent
          input={input()}
          forced={(state() as LoginStateDefault).forced}
          onSubmit={onLoginSubmit}
          onError={onError}
        />
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
    <Show when={state().errorMessage}>
      <ErrorMessage>
        {getErrorMessage()}
      </ErrorMessage>
    </Show>
    <Show when={state().type !== DEFAULT_STATE.type}>
      <ResetText onClick={onResetClick}>{t('login.back_to_login')}</ResetText>
    </Show>
  </>;
};
