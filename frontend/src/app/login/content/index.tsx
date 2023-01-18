import { useRef, useState } from 'react';
import { LoginFormInput } from '../../components/login/form/login';
import { DeviceRegisterType } from '../../components/login/form/device-register';
import type { LoginAccessData, TalkResponseStatus } from '../../../backend/auth';
import { PasscodeContent } from './passcode';
import { DeviceRegisterContent } from './device-register';
import { LoginContent } from './login';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

export type LoginContentProp = {
  defaultInput?: LoginFormInput,
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

const ErrorMessage = styled.p`
  color: red;
`;

const ResetText = styled.p`
  color: #4D5061;
  text-align: center;
  user-select: none;
`;

export const AppLoginContent = ({
  defaultInput,
  onLogin,
}: LoginContentProp) => {
  const { t } = useTranslation();

  const inputRef = useRef(defaultInput ?? {
    email: '',
    password: '',
    saveId: true,
    autoLogin: true,
  });

  const [state, setState] = useState<LoginState>(DEFAULT_STATE);

  function onLoginSubmit(input: LoginFormInput, res: TalkResponseStatus<LoginAccessData>) {
    inputRef.current = input;

    if (res.status === 0) {
      onLogin?.(res as LoginAccessData);
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

    setState((state) => {
      return { ...state, errorMessage: `login.status.login.${res.status}` };
    });
  }

  function onRegisterTypeSelected(status: number, type: DeviceRegisterType) {
    if (status === 0) {
      setState({ type: 'passcode', registerType: type });
      return;
    }

    setState({ ...state, errorMessage: `login.status.device_register.${status}` });
  }

  function onPasscodeSubmit(status: number) {
    if (status === 0) {
      setState(DEFAULT_STATE);
      return;
    }

    setState({ ...state, errorMessage: `login.status.passcode.${status}` });
  }

  function onError() {
    setState({ ...state, errorMessage: `login.network_error` });
  }

  function onResetClick() {
    setState(DEFAULT_STATE);
  }

  let content: JSX.Element;
  switch (state.type) {
    case 'login': {
      content = <LoginContent
        defaultInput={inputRef.current}
        forced={state.forced}
        onSubmit={onLoginSubmit}
        onError={onError}
      />;
      break;
    }

    case 'device_register': {
      content = <DeviceRegisterContent
        input={inputRef.current}
        onSubmit={onRegisterTypeSelected}
        onError={onError}
      />;
      break;
    }

    case 'passcode': {
      content = <PasscodeContent
        registerType={state.registerType}
        input={inputRef.current}
        onSubmit={onPasscodeSubmit}
        onError={onError}
      />;
      break;
    }
  }

  return <>
    {content}
    {state.errorMessage ?
      <ErrorMessage>{t(state.errorMessage)}</ErrorMessage> :
      null
    }
    {
      state.type !== DEFAULT_STATE.type ?
      <ResetText onClick={onResetClick}>{t('login.back_to_login')}</ResetText> :
      null
    }
  </>;
};
