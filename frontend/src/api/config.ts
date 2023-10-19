import { tauri } from '@tauri-apps/api';
import { GlobalConfig } from './_types';

export function loadConfig(): Promise<GlobalConfig> {
  return tauri.invoke<GlobalConfig>('plugin:configuration|load');
}

export function saveConfig(configuration: GlobalConfig): Promise<void> {
  return tauri.invoke('plugin:configuration|save', { configuration });
}
