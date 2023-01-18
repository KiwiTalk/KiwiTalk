import { tauri } from '@tauri-apps/api';

export type LoginAccessData = {
  userId: number,
  countryIso: string,
  countryCode: string,

  accountId: number,

  server_time: number,
  story_url: string,

  access_token: string,
  refresh_token: string,
  token_type: string,

  autoLoginAccountId: string,
  displayAccountId: string,

  mainDeviceAgentName: string,
  mainDeviceAppVersion: string,
}

export type TalkResponseStatus<T = void> = {
  status: number,
} | {
  status: 0
} & T

export function login(
  email: string,
  password: string,
  forced: boolean,
): Promise<TalkResponseStatus<LoginAccessData>> {
  return tauri.invoke<TalkResponseStatus<LoginAccessData>>('plugin:auth|login', {
    email,
    password,
    forced,
  });
}

export function requestPasscode(email: string, password: string): Promise<TalkResponseStatus> {
  return tauri.invoke<TalkResponseStatus>('plugin:auth|request_passcode', {
    email,
    password,
  });
}

export function registerDevice(
  passcode: string,
  email: string,
  password: string,
  permanent: boolean,
): Promise<TalkResponseStatus> {
  return tauri.invoke<TalkResponseStatus>('plugin:auth|register_device', {
    passcode,
    email,
    password,
    permanent,
  });
}
