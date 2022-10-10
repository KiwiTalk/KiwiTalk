import { tauri } from '@tauri-apps/api';

export type AppCredential = {
  accessToken: string,
  refreshToken: string,
  userId?: number
}

export function setCredential(credential: AppCredential): Promise<AppCredential> {
  return tauri.invoke<AppCredential>('plugin:system|set_credential', { credential });
}

export type ClientStatus = { status: 'Locked' } | { status: 'Unlocked' };

export function initializeClient(clientStatus: ClientStatus): Promise<void> {
  return tauri.invoke('plugin:app|next_client_event', { clientStatus });
}

export type KiwiTalkClientEvent = {
  // TODO
}

export function nextClientEvent(): Promise<KiwiTalkClientEvent> {
  return tauri.invoke<KiwiTalkClientEvent>('plugin:app|next_client_event');
}

export type GlobalConfiguration = {
  locale: { type: 'Auto' } | { type: 'Fixed', value: string }
}

export function getGlobalConfiguration(): Promise<GlobalConfiguration> {
  return tauri.invoke<GlobalConfiguration>('plugin:app|get_global_configuration');
}

export function setGlobalConfiguration(configuration: GlobalConfiguration): Promise<void> {
  return tauri.invoke('plugin:app|set_global_configuration', { configuration });
}

