import { tauri } from '@tauri-apps/api';

export type AppCredential = {
  access_token: string,
  refresh_token: string,
  userId?: number
}

export type LoginForm = {
  email: string,
  password: string,
  saveEmail: boolean,
  autoLogin: boolean,
}

export type ClientState = 'NeedLogin' | 'Logon';

export type ClientStatus = 'Locked' | 'Unlocked';

export function getClientState(): Promise<ClientState> {
  return tauri.invoke('plugin:client|get_state');
}

export function defaultLoginForm(): Promise<LoginForm> {
  return tauri.invoke('plugin:client|default_login_form');
}

export function login(form: LoginForm, forced: boolean, status: ClientStatus): Promise<number> {
  return tauri.invoke('plugin:client|login', { form, forced, status });
}

export function logout(): Promise<void> {
  return tauri.invoke('plugin:client|logout');
}

export type KiwiTalkClientEvent = {
  // TODO
}

export function nextClientEvent(): Promise<KiwiTalkClientEvent | void> {
  return tauri.invoke<KiwiTalkClientEvent | void>('plugin:client|next_event');
}

