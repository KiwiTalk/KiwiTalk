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

  private async createElement(chat: Chatlog): Promise<JSX.Element> {
    let attachment: Record<string, unknown> | null = null;
    try {
      attachment = JSON.parse(chat.attachment ?? '{}');
    } catch {
      // ignore
    }

    switch (chat.chatType) {
    case 0: // TODO: Feed
      return 'FEED';
    case 1: // Text
      return (
        <TextMessage
          isLong={false}
          content={chat.content}
          longContent={chat.content}

          onShowMore={() => {}}
        />
      );
    case 2: {// Single Image
      const url = typeof attachment?.url === 'string' ? attachment.url : '';

      return <ImageMessage urls={[url]} />;
    }
    case 18: { // Attachment
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
    case 26: { // Reply
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
          onClickReply={() => {}}
        />
      ));
    }
    case 27: {// Multiple Image
      const urls: string[] = [];
      if (attachment && Array.isArray(attachment?.imageUrls)) {
        urls.push(...attachment.imageUrls.filter((url) => typeof url === 'string'));
      }

      return <ImageMessage urls={urls} />;
    }
    default:
      return <UnknownMessage type={chat.chatType} />;
    }
  }
}
