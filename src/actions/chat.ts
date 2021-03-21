import {
  ChatBuilder, Chatlog, KnownChatType, MediaUploadTemplate, ReplyContent, TalkChannel, TalkClient,
} from 'node-kakao';

export interface ChatContext {
  client: TalkClient;
  channel: TalkChannel;
  chatList: Chatlog[];
}

export interface ChatValue {
  text: string;
  files: File[];
  reply: string | null;
}

export enum ChatResultType {
  SUCCESS,
  FAILED,
}

export interface ChatResult {
  type: ChatResultType;
  value?: any;
}

export async function sendChat(
    { client, channel, chatList }: ChatContext,
    {
      text,
      files,
      reply,
    }: ChatValue,
): Promise<ChatResult> {
  if (files.length > 0) {
    const images: MediaUploadTemplate[] = [];

    for (const file of files) {
      const type = convertType(file.type);
      const data = Buffer.from(new Uint8Array(await file.arrayBuffer()));

      switch (type) {
        case KnownChatType.PHOTO: case KnownChatType.VIDEO: {
          const { width, height } = await getFileSize(file);

          if (type === KnownChatType.PHOTO) {
            images.push({
              name: file.name,
              data,
              width,
              height,
            });
          }

          await channel.sendMedia(
              type,
              {
                name: file.name,
                data,
                width,
                height,
              },
          );
        }
          break;
        default:
          await channel.sendMedia(
              type,
              {
                name: file.name,
                data,
              },
          );
          break;
      }
    }

    if (images.length === 1) {
      await channel.sendMedia(
          KnownChatType.PHOTO,
          {
            ...images[0],
          },
      );
    } else {
      await channel.sendMultiMedia(
          KnownChatType.MULTIPHOTO,
          images,
      );
    }
  }

  if (reply) {
    const replyChat = chatList.find(({ logId }) => logId.equals(reply));

    if (replyChat) {
      const builder = new ChatBuilder().append(new ReplyContent(replyChat));
      const newChat = builder.build(KnownChatType.REPLY);

      const result = await channel.sendChat(newChat);

      return {
        type: ChatResultType.SUCCESS,
        value: result,
      };
    } else {
      return {
        type: ChatResultType.FAILED,
      };
    }
  }

  const result = await channel.sendChat(text);

  if (result) {
    return {
      type: ChatResultType.SUCCESS,
      value: result,
    };
  }

  return {
    type: ChatResultType.FAILED,
  };
}

async function getFileSize(file: File): Promise<{ width: number, height: number }> {
  return new Promise((resolve) => {
    const img = document.createElement('img');
    img.src = window.URL.createObjectURL(file);
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
  });
}

type ConvertResultType = (
  KnownChatType.PHOTO |
  KnownChatType.VIDEO |
  KnownChatType.TEXT |
  KnownChatType.AUDIO |
  KnownChatType.FILE
);
function convertType(mimeType: string): ConvertResultType {
  const [type] = mimeType.split('/');

  switch (type) {
    case 'image': return KnownChatType.PHOTO;
    case 'video': return KnownChatType.VIDEO;
    case 'text': return KnownChatType.TEXT;
    case 'audio': return KnownChatType.AUDIO;
    default: return KnownChatType.FILE;
  }
}
