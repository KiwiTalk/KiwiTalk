import { tauri } from '@tauri-apps/api';

export type AppCredential = {
  access_token: string,
  refresh_token: string,
  userId?: number
}

export function setCredential(credential: AppCredential): Promise<AppCredential> {
  return tauri.invoke<AppCredential>('plugin:client|set_credential', { credential });
}

export type ClientStatus = 'Locked' | 'Unlocked';

export function initializeClient(status: ClientStatus): Promise<void> {
  return tauri.invoke('plugin:client|initialize', { status });
}

export type KiwiTalkClientEvent = {
  // TODO
}

export function nextClientEvent(): Promise<KiwiTalkClientEvent | void> {
  return tauri.invoke<KiwiTalkClientEvent | void>('plugin:client|next_event');
}

