import { LoginForm, LoginFormInput } from '../../components/login/form/login';
import { DeviceRegisterType } from '../../components/login/form/device-register';
import { PasscodeContent } from './passcode';
import { DeviceRegisterContent } from './device-register';
import { useTransContext } from '@jellybrick/solid-i18next';
import { errorMessage, resetText } from './index.css';
import { styled } from '../../../utils';
import { Match, Show, Switch, createResource, createSignal } from 'solid-js';
import { defaultLoginForm, login, takeLoginReason } from '../../../ipc/client';

const ErrorMessage = styled('p', errorMessage);
const ResetText = styled('p', resetText);

export type LoginContentProp = {
  onLogin?: () => void
};

type LoginStateKey<T> = {
  type: T,

  errorMessage?: string,
};

type LoginStateDefault = LoginStateKey<'login'>;

type LoginStateDeviceRegister = LoginStateKey<'device_register'>;

type LoginStatePasscode = LoginStateKey<'passcode'> & {
  registerType: DeviceRegisterType
};

type LoginState = LoginStateDefault | LoginStateDeviceRegister | LoginStatePasscode;

const DEFAULT_STATE: LoginState = { type: 'login' };

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
      submit(input());
      return;
    }

    setState({ ...state(), errorMessage: `login.status.passcode.${status}` });
  }

  function onError(err: unknown) {
    console.error(err);
    setState({ ...state(), errorMessage: `login.generic_error` });
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
    if (forced()) {
      errorMessage += ` ${t('login.set_forced')}`;
    }

    return errorMessage;
  }

  async function submit(input: LoginFormInput) {
    try {
      const status = await login({
        email: input.email,
        password: input.password,
        saveEmail: input.saveId,
        autoLogin: input.autoLogin,
      }, forced(), 'Unlocked');

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
          setForced(true);
          break;
        }
      }

      setState({ ...state(), errorMessage: `login.status.login.${status}` });
    } catch (e) {
      setState({ ...state(), errorMessage: `login.generic_error` });
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
