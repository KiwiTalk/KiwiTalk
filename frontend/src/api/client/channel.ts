import { tauri } from '@tauri-apps/api';

class NormalChannel implements ClientChannel {
  public id: string;

  #rid: number;

  constructor(rid: number, id: string) {
    this.#rid = rid;
    this.id = id;
  }

  async close() {
    await tauri.invoke('plugin:client|close_channel', { rid: this.#rid });
  }

  async sendText(text: string): Promise<Chatlog> {
    return await tauri.invoke('plugin:client|channel_send_text', { rid: this.#rid, text });
  }

  async readChat(logId: string) {
    await tauri.invoke('plugin:client|channel_read_chat', { rid: this.#rid, logId });
  }

  async loadChat(
    count: number,
    fromLogId?: string,
    exclusive: boolean = false,
  ): Promise<Chatlog[]> {
    return await tauri.invoke(
      'plugin:client|channel_load_chat',
      { rid: this.#rid, count, exclusive, fromLogId },
    );
  }

  async getUsers(): Promise<[string, NormalChannelUser][]> {
    return await tauri.invoke(
      'plugin:client|channel_users',
      { rid: this.#rid },
    );
  }
}

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
  revision: number,
  authorId: number,
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

export interface ClientChannel {
  id: string;

  sendText(text: string): Promise<Chatlog>;

  readChat(logId: string): Promise<void>;

  loadChat(count: number, fromLogId?: string, exclusive?: boolean): Promise<Chatlog[]>;

  getUsers(): Promise<[string, ChannelUser][]>;

  close(): Promise<void>;
}

export async function openChannel(id: string): Promise<NormalChannel> {
  const rid = await tauri.invoke<number>('plugin:client|open_channel', { id });

  return new NormalChannel(rid, id);
}
