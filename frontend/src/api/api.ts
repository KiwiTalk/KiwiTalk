import { tauri } from '@tauri-apps/api';

import {
  FriendsUpdate,
  LoginDetailForm,
  LoginForm,
  LoginResult,
  LogonProfile,
  Profile,
  Response,
} from './_types';

export function defaultLoginForm(): Promise<LoginDetailForm> {
  return tauri.invoke('plugin:api|default_login_form');
}

export function logon(): Promise<boolean> {
  return tauri.invoke('plugin:api|logon');
}

export function autoLogin(): Promise<Response<boolean>> {
  return tauri.invoke('plugin:api|auto_login');
}

export function login(form: LoginForm, forced: boolean): Promise<Response<void>> {
  return tauri.invoke('plugin:api|login', { form, forced });
}

export function logout(): Promise<boolean> {
  return tauri.invoke('plugin:api|logout');
}

export function requestPasscode(email: string, password: string): Promise<Response<void>> {
  return tauri.invoke('plugin:api|request_passcode', {
    email,
    password,
  });
}

export function registerDevice(
  passcode: string,
  email: string,
  password: string,
  permanent: boolean,
): Promise<Response<void>> {
  return tauri.invoke('plugin:api|register_device', {
    passcode,
    email,
    password,
    permanent,
  });
}

export function meProfile(): Promise<LogonProfile> {
  return tauri.invoke('plugin:api|me_profile');
}

export function friendProfile(id: string): Promise<Profile> {
  return tauri.invoke('plugin:api|friend_profile', { id });
}

export function updateFriends(friendIds: string[]): Promise<FriendsUpdate> {
  return tauri.invoke('plugin:api|update_friends', { friendIds });
}

export const loginWithResult = async (
  loginForm: LoginForm,
  forced = false,
): Promise<LoginResult> => {
  if (!loginForm?.email || !loginForm?.password) {
    return {
      type: 'Error',
      key: 'login.reason.required_id_password',
    };
  }

  let key: string = 'login.generic_error';
  let newForced = false;
  let detail: unknown = null;
  try {
    const response = await login({
      email: loginForm.email,
      password: loginForm.password,
      saveEmail: loginForm.saveEmail,
      autoLogin: loginForm.autoLogin,
    }, forced);

    if (response.type === 'Success') return { type: 'Success' };

    if (response.content === -100) return { type: 'NeedRegister' };
    if (response.content === -101) newForced = true;

    key = `login.status.login.${response.content}`;
  } catch (e) {
    console.error(e);
    key = 'login.unknown_error';
    detail = e;
  }

  return {
    type: 'Error',
    key,
    forced: newForced,
    detail,
  };
};
