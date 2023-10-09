import { tauri } from '@tauri-apps/api';

export type ClientStatus = 'Locked' | 'Unlocked';

export function created(): Promise<boolean> {
  return tauri.invoke('plugin:client|created');
}

export function create(status: ClientStatus): Promise<number> {
  return tauri.invoke('plugin:client|create', { status });
}

export function destroy(): Promise<void> {
  return tauri.invoke('plugin:client|destroy');
}

export type KiwiTalkMainEvent = {
  type: 'kickout',
  content: { reason: number },
} | {
  type: 'chat',
  content: {
    channel: string,
    previewMessage: string,
    unreadCount: number,
  },
}

export function nextMainEvent(): Promise<KiwiTalkMainEvent | null> {
  return tauri.invoke('plugin:client|next_main_event');
}

export type ChannelListItem = {
  channelType: string,

  displayUsers: {
    nickname: string,
    profileUrl?: string,
  }[],

  lastChat?: {
    chatType: number,
    nickname?: string,
    content: {
      message?: string,
      attachment?: string,
      supplement?: string,
    },
  },

  name?: string,
  profile?: string,

  unreadCount: number,

  userCount: number,
}

export function getChannelList(): Promise<[string, ChannelListItem][]> {
  return tauri.invoke('plugin:client|channel_list');
}
