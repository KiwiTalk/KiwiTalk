import { useRef, useState } from 'react';
import { LoginForm, LoginFormInput } from '../components/login/form/login';
import { DeviceRegisterForm, DeviceRegisterType } from '../components/login/form/device-register';
import { PasscodeForm } from '../components/login/form/passcode';
import { tauri } from '@tauri-apps/api';
import type { LoginAccessData, TalkResponseStatus } from './auth-types';

export type LoginContentProp = {
  defaultInput?: LoginFormInput,
  onLogin?: (data: LoginAccessData) => void
};

type AppLoginDefault = {
  type: 'login'
};

type AppLoginDeviceRegister = {
  type: 'device_register'
};

type AppLoginPasscode = {
  type: 'passcode',
  registerType: DeviceRegisterType
};

type AppLoginState = AppLoginDefault | AppLoginDeviceRegister | AppLoginPasscode;

const DEFAULT_STATE: AppLoginState = { type: 'login' };

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

  function onLoginFormSubmit(input: LoginFormInput) {
    inputRef.current = input;

    (async () => {
      const res = await tauri.invoke<TalkResponseStatus<LoginAccessData>>('plugin:auth|login', {
        email: inputRef.current.email,
        password: inputRef.current.password,
        forced: false,
      });
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
      }
    })().then().catch(console.error);
  }

  function onRegisterTypeSelected(type: DeviceRegisterType) {
    (async () => {
      const res = await tauri.invoke<TalkResponseStatus>('plugin:auth|request_passcode', {
        email: inputRef.current.email,
        password: inputRef.current.password,
      });

      if (res.status === 0) {
        setState({ type: 'passcode', registerType: type });
        return;
      }
    })().then().catch(console.error);
  }

  function onPasscodeSubmit(passcode: string) {
    (async () => {
      const res = await tauri.invoke<TalkResponseStatus>('plugin:auth|register_device', {
        passcode,
        email: inputRef.current.email,
        password: inputRef.current.password,
        permanent: (state as AppLoginPasscode).registerType === 'permanent',
      });

      if (res.status === 0) {
        onLoginFormSubmit(inputRef.current);
        setState({ type: 'login' });
        return;
      }
    })().then().catch(console.error);
  }

  let content: JSX.Element;
  switch (state.type) {
    case 'login': {
      content = <LoginForm input={inputRef.current} onSubmit={onLoginFormSubmit} />;
      break;
    }

    case 'device_register': {
      content = <DeviceRegisterForm onSubmit={onRegisterTypeSelected} />;
      break;
    }

    case 'passcode': {
      content = <PasscodeForm onSubmit={onPasscodeSubmit} />;
      break;
    }
  }

  return content;
};
