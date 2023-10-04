import { tauri } from '@tauri-apps/api';

export function requestPasscode(email: string, password: string): Promise<number> {
  return tauri.invoke<number>('plugin:auth|request_passcode', {
    email,
    password,
  });
}

export function registerDevice(
  passcode: string,
  email: string,
  password: string,
  permanent: boolean,
): Promise<number> {
  return tauri.invoke<number>('plugin:auth|register_device', {
    passcode,
    email,
    password,
    permanent,
  });
}
