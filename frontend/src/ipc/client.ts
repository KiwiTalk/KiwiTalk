import { tauri } from '@tauri-apps/api';

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

export type LoginReason = {
  type: 'AutoLoginFailed',
  content: AutoLoginError,
} | {
  type: 'Kickout'
};

export type AutoLoginError = {
  type: 'InvalidFile'
} | {
  type: 'Status',
  content: number,
} | {
  type: 'Other',
  content: string,
};

export function takeLoginReason(): Promise<LoginReason | null> {
  return tauri.invoke('plugin:client|take_login_reason');
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

export type KiwiTalkMainEvent = {
  type: 'kickout',
  content: { reason: number },
} | {
  type: 'chat',
  content: {
    channel: string,
    previewMessage: string,
    unreadCount: number,
  },
}

export function nextMainEvent(): Promise<KiwiTalkMainEvent | null> {
  return tauri.invoke('plugin:client|next_main_event');
}

export function getUserEmail(): Promise<string> {
  return tauri.invoke('plugin:client|user_email');
}

