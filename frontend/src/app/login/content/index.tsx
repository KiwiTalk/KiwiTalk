import { LoginFormInput } from '../../components/login/form/login';
import { DeviceRegisterType } from '../../components/login/form/device-register';
import type { LoginAccessData, TalkResponseStatus } from '../../../ipc/auth';
import { PasscodeContent } from './passcode';
import { DeviceRegisterContent } from './device-register';
import { LoginContent } from './login';
import { useTransContext } from '@jellybrick/solid-i18next';
import { errorMessage, resetText } from './index.css';
import { styled } from '../../../utils';
import { Match, Show, Switch, createSignal } from 'solid-js';
import { AuthConfiguration, useConfiguration } from '../../../store/global';

const ErrorMessage = styled('p', errorMessage);
const ResetText = styled('p', resetText);

export type LoginContentProp = {
  input?: LoginFormInput,
  onLogin?: (data: LoginAccessData) => void
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
  const [config, setConfig] = useConfiguration();


  const input = () => {
    if (props.input) {
      return props.input;
    }

    const auth = config().configuration.auth;
    if (auth) {
      return {
        email: auth.email,
        password: '',
        saveId: true,
        autoLogin: auth.type === 'AutoLogin',
      };
    }

    return {
      email: '',
      password: '',
      saveId: true,
      autoLogin: true,
    };
  };

  const [state, setState] = createSignal<LoginState>(DEFAULT_STATE);

  function onLoginSubmit(input: LoginFormInput, res: TalkResponseStatus<LoginAccessData>) {
    let auth: AuthConfiguration = null;

    if (input.saveId) {
      auth = {
        type: 'SaveAccount',
        email: input.email,
      };
    }

    if (input.autoLogin && res.status === 0) {
      auth = {
        type: 'AutoLogin',
        email: input.email,
        token: (res as LoginAccessData).access_token,
      };
    }

    setConfig({ auth });

    if (res.status === 0) {
      props.onLogin?.(res as LoginAccessData);
      return;
    }

    switch (res.status) {
      case -100: {
        setState({ type: 'device_register' });
        return;
      }

      case -101: {
        setState({ type: 'login', forced: true });
        break;
      }
    }

    setState({ ...state(), errorMessage: `login.status.login.${res.status}` });
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

  function onError() {
    setState({ ...state(), errorMessage: `login.network_error` });
  }

  function onResetClick() {
    setState(DEFAULT_STATE);
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
        {t(state().errorMessage!)}
      </ErrorMessage>
    </Show>
    <Show when={state().type !== DEFAULT_STATE.type}>
      <ResetText onClick={onResetClick}>{t('login.back_to_login')}</ResetText>
    </Show>
  </>;
};
