import { tauri } from '@tauri-apps/api';

export type Response<T> = { type: 'Success', content: T } | { type: 'Failure', content: number };

export type State = 'NeedLogin' | 'Logon';

export type LoginForm = {
  email: string,
  password: string,
  saveEmail: boolean,
  autoLogin: boolean,
}

export function defaultLoginForm(): Promise<LoginForm> {
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

export type LogonProfile = {
  name: string,

  id: string,
  idSearchable: boolean,

  email: string,
  emailVerified: boolean,

  status_message: string,

  pstnNumber: string,

  profileUrl: string,
  backgroundUrl: string,
}

export function meProfile(): Promise<Response<LogonProfile>> {
  return tauri.invoke('plugin:api|me');
}
