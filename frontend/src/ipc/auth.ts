import { tauri } from '@tauri-apps/api';

export type TalkResponseStatus<T = void> = {
  status: number,
} | {
  status: 0
} & T

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
