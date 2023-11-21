import { ResponseType, getClient } from '@tauri-apps/api/http';
import { JSXElement } from 'solid-js';

import {
  ReplyMessage,
  ImageMessage,
  LongTextMessage,
  FileMessage,
  EmoticonMessage,
} from '../_components/message';
import { Channel } from '@/api/client';
import { factoryMethod, expectOr, expect, parseObject } from './util';

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

export type ChatMessage = {
  content?: string,
  attachment?: string,
}

export type ContentComponentFn = () => JSXElement;

export class ChatContentFactory {
  constructor(private channel: Channel) { }

  @factoryMethod('Text')
  async createText(chat: ChatMessage, onExpand?: () => void): Promise<ContentComponentFn> {
    const content = expect(chat, 'content', 'string');

    return () => {
      if (!content || content.length < 500) {
        return content;
      }

      return <LongTextMessage
        content={`${content.slice(0, 500)}...`}

        onExpand={onExpand}
      />;
    };
  }

  @factoryMethod('SingleImage')
  async createSingleImage(chat: ChatMessage): Promise<ContentComponentFn> {
    const attachment = parseObject(expect(chat, 'attachment', 'string'));
    const url = expectOr(attachment, 'url', 'string', '');

    return () => <ImageMessage urls={[url]} />;
  }

  @factoryMethod('Emoticon')
  async createEmoticon(chat: ChatMessage, encrypted: boolean): Promise<ContentComponentFn> {
    const attachment = parseObject(expect(chat, 'attachment', 'string'));
    const baseURL = 'http://item-kr.talk.kakao.co.kr/dw/';

    const sound = expectOr(attachment, 'sound', 'string', null);
    let soundUrl: string | undefined = undefined;
    if (sound) {
      soundUrl = `${baseURL}${sound}`;
    }

    const alt = expectOr(attachment, 'alt', 'string', undefined);

    let url = expectOr(attachment, 'path', 'string', expect(attachment, 'url', 'string'));
    if (encrypted) {
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

    return () => <EmoticonMessage
      src={url}
      sound={soundUrl}
      alt={alt}
    />;
  }

  @factoryMethod('File')
  async createFile(chat: ChatMessage): Promise<ContentComponentFn> {
    const attachment = parseObject(expect(chat, 'attachment', 'string'));

    const mimeType = expectOr(attachment, 'mime', 'string', 'application/octet-stream');

    const fileName = expectOr(attachment, 'name', 'string', undefined);

    const fileSize = expectOr(attachment, 'size', 'number', undefined);
    const expire = expectOr(attachment, 'expire', 'number', undefined);

    return () => <FileMessage
      mimeType={mimeType}
      fileName={fileName}
      fileSize={fileSize}
      expire={expire}
    />;
  }

  @factoryMethod('Reply')
  async createReply(
    chat: ChatMessage,
    nicknameLookupFn: (userId: string) => string | undefined,
    onReplyClick?: () => void,
  ): Promise<ContentComponentFn> {
    const attachment = parseObject(expect(chat, 'attachment', 'string'));

    const replyContent = expect(attachment, 'src_message', 'string');
    const userId = expect(attachment, 'src_userId', 'long');
    const nickname = nicknameLookupFn(userId.toString());

    return () => <ReplyMessage
      content={chat.content}
      replyContent={replyContent}
      replySender={nickname}
      onReplyClick={onReplyClick}
    />;
  }

  @factoryMethod('MultiImage')
  async createMultiImage(chat: ChatMessage): Promise<ContentComponentFn> {
    const attachment = parseObject(expect(chat, 'attachment', 'string'));
    const urls: string[] = [];

    const imageUrls = expect(attachment, 'imageUrls', 'object');
    if (Array.isArray(imageUrls)) {
      urls.push(...imageUrls.filter((url) => typeof url === 'string'));
    }

    return () => <ImageMessage urls={urls} />;
  }
}
