import { JSX, Owner, runWithOwner } from 'solid-js';
import { Chatlog, ClientChannel } from '@/api/client';

import {
  ReplyMessage,
  ImageMessage,
  TextMessage,
  UnknownMessage,
  AttachmentMessage,
} from '../_components/message';

export class ChatFactory {
  private channel: ClientChannel;
  private chatMap: Record<string, JSX.Element> = {};
  private owner: Owner | null = null;

  constructor(channel: ClientChannel, owner: Owner | null) {
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
    case 18: return this.createAttachmentElement(chat); // Attachment
    case 26: return this.createReplyElement(chat); // Reply
    case 27: return this.createMultipleImageElement(chat); // Multiple Image
    default: return <UnknownMessage type={chat.chatType} />;
    }
  }

  private createTextElement(chat: Chatlog): JSX.Element {
    const isLong = typeof chat.content === 'string' && chat.content.length > 500;
    let content = chat.content ?? '';
    if (isLong) content = `${content.slice(0, 500)}...`;

    return (
      <TextMessage
        isLong={isLong}
        content={content}
        longContent={chat.content}

        onShowMore={() => {
          // TODO: implement onShowMore
        }}
      />
    );
  }

  private createSingleImageElement(chat: Chatlog): JSX.Element {
    const attachment = this.getAttachment(chat);
    const url = typeof attachment?.url === 'string' ? attachment.url : '';

    return <ImageMessage urls={[url]} />;
  }

  private createAttachmentElement(chat: Chatlog): JSX.Element {
    const attachment = this.getAttachment(chat);
    const mimeType = typeof attachment?.mime === 'string' ?
      attachment.mime :
      'application/octet-stream';
    const fileName = typeof attachment?.name === 'string' ?
      attachment.name :
      'unknown';
    const fileSize = Number(attachment?.size ?? 0);
    const expire = Number(attachment?.expire ?? 0);

    return (
      <AttachmentMessage
        mimeType={mimeType}
        fileName={fileName}
        fileSize={fileSize}
        expire={expire}
      />
    );
  }

  private async createReplyElement(chat: Chatlog): Promise<JSX.Element> {
    const attachment = this.getAttachment(chat);
    const members = Object.fromEntries(await this.channel.getUsers());
    const replyContent = typeof attachment?.src_message === 'string' ?
      attachment.src_message :
      '...';
    const nickname = typeof attachment?.src_userId === 'number' ?
      members[attachment.src_userId]?.nickname :
      '...';

    return runWithOwner(this.owner, () => (
      <ReplyMessage
        content={chat.content}
        replyContent={replyContent}
        replySender={nickname}
        onClickReply={() => {
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
