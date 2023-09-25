import { tauri } from '@tauri-apps/api';
import { GlobalConfiguration } from '../store/global';

export function loadConfiguration(): Promise<GlobalConfiguration> {
  return tauri.invoke<GlobalConfiguration>('plugin:configuration|load');
}

export function saveConfiguration(configuration: GlobalConfiguration): Promise<void> {
  return tauri.invoke('plugin:configuration|save', { configuration });
}
