import { ResponseType, getClient } from '@tauri-apps/api/http';
import { JSX, Owner, runWithOwner } from 'solid-js';
import { Channel, ChannelUser, Chatlog } from '@/api/client';

import {
  ReplyMessage,
  ImageMessage,
  LongTextMessage,
  UnknownMessage,
  FileMessage,
  EmoticonMessage,
} from '../_components/message';


const EMOTICON_DECODE_ARRAY = new Uint8Array([
  231, 173, 66, 91, 22, 241, 129, 25, 102, 66, 60, 68, 103, 141, 68, 184,
  78, 88, 28, 233, 195, 218, 28, 80, 71, 76, 239, 80, 74, 139, 192, 203,
  63, 17, 179, 228, 52, 112, 160, 122, 163, 174, 44, 91, 75, 17, 195, 1,
  35, 126, 130, 89, 76, 29, 195, 205, 1, 210, 28, 35, 107, 227, 159, 182,
  178, 46, 96, 215, 167, 169, 254, 158, 63, 186, 88, 93, 100, 241, 160, 130,
  20, 108, 87, 178, 253, 154, 18, 73, 77, 56, 95, 210, 144, 111, 252, 155,
  141, 203, 197, 126, 183, 12, 1, 87, 125, 35, 78, 79, 189, 72, 132, 3,
  148, 81, 104, 41, 248, 207, 75, 75, 58, 67, 24, 86, 8, 61, 226, 140,
]);

export class ChatFactory {
  private channel: Channel;
  private chatMap: Record<string, JSX.Element> = {};
  private owner: Owner | null = null;

  constructor(channel: Channel, owner: Owner | null) {
    this.channel = channel;
    this.owner = owner;
  }

  async create(chat: Chatlog): Promise<JSX.Element> {
    if (this.chatMap[chat.logId]) {
      return this.chatMap[chat.logId];
    }

    const element = await this.createElement(chat);

    this.chatMap[chat.logId] = element;

    return element;
  }

  private getAttachment(chat: Chatlog): Record<string, unknown> | null {
    try {
      return JSON.parse(chat.attachment ?? '{}');
    } catch {
      return null;
    }
  }

  private async createElement(chat: Chatlog): Promise<JSX.Element> {
    switch (chat.chatType) {
    case 1: return this.createTextElement(chat); // Text
    case 2: return this.createSingleImageElement(chat); // Signle Image
    case 6: return this.createEmoticonElement(chat); // Emoticon (gif) (legacy)
    case 12: return this.createEmoticonElement(chat); // Emoticon (default)
    case 18: return this.createAttachmentElement(chat); // Attachment
    case 20: return this.createEmoticonElement(chat); // Emoticon (webp)
    case 25: return this.createEmoticonElement(chat); // Emoticon (gif)
    case 26: return this.createReplyElement(chat); // Reply
    case 27: return this.createMultipleImageElement(chat); // Multiple Image
    default: return <UnknownMessage type={chat.chatType} />;
    }
  }

  private createTextElement(chat: Chatlog): JSX.Element {
    if (!chat.content || chat.content.length < 500) {
      return chat.content;
    }

    return <LongTextMessage
      content={`${chat.content.slice(0, 500)}...`}
      onExpand={() => {}}
    />;
  }

  private createSingleImageElement(chat: Chatlog): JSX.Element {
    const attachment = this.getAttachment(chat);
    const url = typeof attachment?.url === 'string' ? attachment.url : '';

    return <ImageMessage urls={[url]} />;
  }

  private async createEmoticonElement(chat: Chatlog): Promise<JSX.Element> {
    const baseURL = 'http://item-kr.talk.kakao.co.kr/dw/';
    const attachment = this.getAttachment(chat);

    let url = (
      typeof attachment?.path === 'string' ? `${baseURL}${attachment.path}` :
        typeof attachment?.url === 'string' ? `${baseURL}${attachment.url}` :
          undefined
    );
    const sound = typeof attachment?.sound === 'string' ?
      `${baseURL}${attachment.sound}` :
      undefined;
    const alt = typeof attachment?.alt === 'string' ?
      attachment.alt :
      undefined;

    if (typeof url !== 'string') return <UnknownMessage type={chat.chatType} />;

    if (chat.chatType === 20 || chat.chatType === 6 || chat.chatType === 25) {
      const client = await getClient();
      const response = await client.get<number[]>(url, {
        responseType: ResponseType.Binary,
      });

      const data = new Uint8Array(response.data);
      for (let i = 0; i < 128; i++) {
        data[i] ^= EMOTICON_DECODE_ARRAY[i % EMOTICON_DECODE_ARRAY.length];
      }

      const decodedBlob = new Blob([data], { type: 'image/webp' });
      url = URL.createObjectURL(decodedBlob);
    }

    return runWithOwner(this.owner, () => (
      <EmoticonMessage
        src={url!}
        sound={sound}
        alt={alt}
      />
    ));
  }

  private createAttachmentElement(chat: Chatlog): JSX.Element {
    const attachment = this.getAttachment(chat);
    const mimeType = typeof attachment?.mime === 'string' ?
      attachment.mime :
      'application/octet-stream';
    const fileName = typeof attachment?.name === 'string' ?
      attachment.name :
      undefined;
    const fileSize = Number(attachment?.size ?? 0);
    const expire = Number(attachment?.expire ?? 0);

    return (
      <FileMessage
        mimeType={mimeType}
        fileName={fileName}
        fileSize={fileSize}
        expire={expire}
      />
    );
  }

  private async createReplyElement(chat: Chatlog): Promise<JSX.Element> {
    const attachment = this.getAttachment(chat);
    const members: Record<string, ChannelUser> = {};

    if (this.channel.kind === 'normal') {
      this.channel.content.users.forEach(([id, user]) => {
        members[id] = user;
      });
    }

    const replyContent = typeof attachment?.src_message === 'string' ?
      attachment.src_message :
      undefined;
    const nickname = typeof attachment?.src_userId === 'number' ?
      members[attachment.src_userId]?.nickname :
      undefined;

    return runWithOwner(this.owner, () => (
      <ReplyMessage
        content={chat.content}
        replyContent={replyContent}
        replySender={nickname}
        onReplyClick={() => {
          // TODO: implement move to refered chat
        }}
      />
    ));
  }

  private createMultipleImageElement(chat: Chatlog): JSX.Element {
    const attachment = this.getAttachment(chat);
    const urls: string[] = [];

    if (attachment && Array.isArray(attachment?.imageUrls)) {
      urls.push(...attachment.imageUrls.filter((url) => typeof url === 'string'));
    }

    return <ImageMessage urls={urls} />;
  }
}
