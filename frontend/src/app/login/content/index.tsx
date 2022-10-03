import { useRef, useState } from 'react';
import { LoginFormInput } from '../../components/login/form/login';
import { DeviceRegisterType } from '../../components/login/form/device-register';
import type { LoginAccessData, TalkResponseStatus } from '../auth';
import { PasscodeContent } from './passcode';
import { DeviceRegisterContent } from './device-register';
import { LoginContent } from './login';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

export type LoginContentProp = {
  defaultInput?: LoginFormInput,
  onLogin?: (data: LoginAccessData) => void
};

type AppLoginDefault = {
  type: 'login',
  forced: boolean
};

type AppLoginDeviceRegister = {
  type: 'device_register'
};

type AppLoginPasscode = {
  type: 'passcode',
  registerType: DeviceRegisterType
};

type AppLoginState = AppLoginDefault | AppLoginDeviceRegister | AppLoginPasscode;

const DEFAULT_STATE: AppLoginState = { type: 'login', forced: false };

const ErrorMessage = styled.p`
  color: red;
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

  const [state, setState] = useState<AppLoginState>(DEFAULT_STATE);
  const [errorMessage, setErrorMessage] = useState<string>('');

  function onLoginSubmit(input: LoginFormInput, res: TalkResponseStatus<LoginAccessData>) {
    inputRef.current = input;

    if (res.status === 0) {
      onLogin?.(res as LoginAccessData);
      return;
    }

    switch (res.status) {
      case -30: {
        break;
      }

      case -100: {
        setState({ type: 'device_register' });
        break;
      }

      case -101: {
        setState({ type: 'login', forced: true });
        break;
      }
    }

    setErrorMessage(`login.status.login.${res.status}`);
  }

  function onRegisterTypeSelected(status: number, type: DeviceRegisterType) {
    if (status === 0) {
      setState({ type: 'passcode', registerType: type });
      return;
    }

    setErrorMessage(`login.status.device_register.${status}`);
  }

  function onPasscodeSubmit(status: number) {
    if (status === 0) {
      setState(DEFAULT_STATE);
      return;
    }

    setErrorMessage(`login.status.passcode.${status}`);
  }

  function onError() {
    setErrorMessage(`login.network_error`);
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
    {errorMessage !== '' ?
      <ErrorMessage>{t(errorMessage)}</ErrorMessage> :
      null
    }
  </>;
};
