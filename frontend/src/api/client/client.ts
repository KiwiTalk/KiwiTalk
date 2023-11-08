import { tauri } from '@tauri-apps/api';

import { ChannelListItem, ClientStatus, KiwiTalkEvent } from '../_types';

export function created(): Promise<boolean> {
  return tauri.invoke('plugin:client|created');
}

export function create(status: ClientStatus): Promise<number> {
  return tauri.invoke('plugin:client|create', { status });
}

export function destroy(): Promise<void> {
  return tauri.invoke('plugin:client|destroy');
}

export function nextEvent(): Promise<KiwiTalkEvent | null> {
  return tauri.invoke('plugin:client|next_event');
}

export function getChannelList(): Promise<[string, ChannelListItem][]> {
  return tauri.invoke('plugin:client|channel_list');
}

export async function* createMainEventStream(): AsyncGenerator<KiwiTalkMainEvent> {
  let nextEvent: KiwiTalkMainEvent | null;

  while ((nextEvent = await nextEvent())) {
    yield nextEvent;
  }
}
