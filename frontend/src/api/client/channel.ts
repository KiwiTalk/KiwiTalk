import { tauri } from '@tauri-apps/api';

export type Chatlog = {
  /** bigint */
  logId: string;
  /** bigint */
  prevLogId?: string;

  senderId: string;
  sendAt: number;

  chatType: number;

  content?: string;
  attachment?: string;
  supplement?: string;

  referer?: number;
}

export type ChannelMeta = {
  type: number,
  revision: string,
  authorId: string,
  updated_at: number,
  content: string,
};

export type ChannelUser = {
  nickname: string;

  profileUrl: string;
  fullProfileUrl: string;
  originalProfileUrl: string;

  /** bigint */
  watermark: string;
}

export type NormalChannelUser = {
  countryIso: string;
  statusMessage: string;
  accountId: string;
  linkedServices: string;
  suspended: boolean;
} & ChannelUser;

type NormalChannelKind = {
  kind: 'normal',
  content: {
    users: [string, NormalChannelUser][],
  }
}
type OpenChannelKind = {
  kind: 'open',
}

export type Channel = NormalChannelKind | OpenChannelKind;

export async function loadChannel(id: string): Promise<Channel> {
  return tauri.invoke('plugin:client|load_channel', { id });
}

export async function sendText(id: string, text: string): Promise<Chatlog> {
  return await tauri.invoke('plugin:client|channel_send_text', { id, text });
}

export async function normalChannelReadChat(id: string, logId: string) {
  await tauri.invoke('plugin:client|normal_channel_read_chat', { id, logId });
}

export async function loadChat(
  id: string,
  count: number,
  fromLogId?: string,
  exclusive: boolean = false,
): Promise<Chatlog[]> {
  return await tauri.invoke(
    'plugin:client|channel_load_chat',
    { id, count, exclusive, fromLogId },
  );
}
