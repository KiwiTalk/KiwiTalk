import { tauri } from '@tauri-apps/api';

class TempImpl implements ClientChannel {
  #rid: number;

  constructor(rid: number) {
    this.#rid = rid;
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
}

export type Chatlog = {
  logId: string,
  prevLogId?: string,

  senderId: string,
  sendAt: number,

  chatType: number,

  content?: string,
  attachment?: string,
  supplement?: string,

  referer?: number,
}

export interface ClientChannel {
  sendText(text: string): Promise<Chatlog>;

  readChat(logId: string): Promise<void>;

  loadChat(count: number, fromLogId?: string, exclusive?: boolean): Promise<Chatlog[]>;

  close(): Promise<void>;
}

export async function openChannel(id: string): Promise<ClientChannel> {
  const rid = await tauri.invoke<number>('plugin:client|open_channel', { id });

  return new TempImpl(rid);
}
