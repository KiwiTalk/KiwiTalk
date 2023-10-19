import { tauri } from '@tauri-apps/api';

export function getDeviceLocale(): Promise<string> {
  return tauri.invoke<string>('plugin:system|get_device_locale');
}

export function getDeviceName(): Promise<string> {
  return tauri.invoke<string>('plugin:system|get_device_name');
}
