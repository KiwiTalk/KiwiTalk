import { useRef, useState } from 'react';
import { LoginFormInput } from '../../components/login/form/login';
import { DeviceRegisterType } from '../../components/login/form/device-register';
import type { LoginAccessData, TalkResponseStatus } from '../auth';
import { PasscodeContent } from './passcode';
import { DeviceRegisterContent } from './device-register';
import { LoginContent } from './login';

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

export const AppLoginContent = ({
  defaultInput,
  onLogin,
}: LoginContentProp) => {
  const inputRef = useRef(defaultInput ?? {
    email: '',
    password: '',
    saveId: true,
    autoLogin: true,
  });

  const [state, setState] = useState<AppLoginState>(DEFAULT_STATE);

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
  }

  function onRegisterTypeSelected(status: number, type: DeviceRegisterType) {
    if (status === 0) {
      setState({ type: 'passcode', registerType: type });
      return;
    }
  }

  function onPasscodeSubmit(status: number) {
    if (status === 0) {
      setState(DEFAULT_STATE);
      return;
    }
  }

  function onError(e: unknown) {
    // TODO:: Show network error message
    console.error(e);
  }

  switch (state.type) {
    case 'login': {
      return <LoginContent
        defaultInput={inputRef.current}
        forced={state.forced}
        onSubmit={onLoginSubmit}
        onError={onError}
      />;
    }

    case 'device_register': {
      return <DeviceRegisterContent
        input={inputRef.current}
        onSubmit={onRegisterTypeSelected}
        onError={onError}
      />;
    }

    case 'passcode': {
      return <PasscodeContent
        registerType={state.registerType}
        input={inputRef.current}
        onSubmit={onPasscodeSubmit}
        onError={onError}
      />;
    }
  }
};
