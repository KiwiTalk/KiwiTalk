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

export type Profile = {
  id: string,

  nickname: string,

  status_message: string,

  profile_url: string,
  background_url: string,
};

export type LogonProfile = {
  uuid: string,
  uuidSearchable: boolean,

  email: string,
  emailVerified: boolean,

  pstnNumber: string,

  profile: Profile,
}

export function meProfile(): Promise<LogonProfile> {
  return tauri.invoke('plugin:api|me_profile');
}

export function friendProfile(id: string): Promise<Profile> {
  return tauri.invoke('plugin:api|friend_profile', { id });
}

export type Friend = {
  userId: string,

  nickname: string,

  userType: number,
  userCategory: number,

  statusMessage: string,

  profileImageUrl: string,
}

export type FriendsUpdate = {
  added: Friend[],
  removedIds: string[],
}

export function updateFriends(friendsIds: string[]): Promise<FriendsUpdate> {
  return tauri.invoke('plugin:api|update_friends', { friendsIds });
}
