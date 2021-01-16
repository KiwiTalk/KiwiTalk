import {
  Chat,
  ChatChannel,
  ChatType, ReplyAttachment, SizedMediaItemTemplate,
  TalkClient, AttachmentTemplate,
} from 'node-kakao';

export interface ChatContext {
  client: TalkClient;
  channel: ChatChannel;
  chatList: Chat[];
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
    const images: SizedMediaItemTemplate[] = [];

    for (const file of files) {
      const type = convertType(file.type);
      const data = Buffer.from(new Uint8Array(await file.arrayBuffer()));

      switch (type) {
        case ChatType.Photo: case ChatType.Video: {
          const { width, height } = await getFileSize(file);

          if (type === ChatType.Photo) {
            images.push({
              name: file.name,
              data,
              width,
              height,
            });
          }

          await channel.sendMedia({
            name: file.name,
            data,
            type,
            width,
            height,
          });
        }
          break;
        default:
          await channel.sendMedia({
            name: file.name,
            data,
            type,
          });
          break;
      }
    }

    if (images.length === 1) {
      await channel.sendMedia({
        type: ChatType.Photo,
        ...images[0],
      });
    } else {
      await channel.sendMedia({
        type: ChatType.MultiPhoto,
        mediaList: images,
      });
    }
  }

  if (reply) {
    const replyChat = chatList.find(({ LogId }) => LogId.equals(reply));

    if (replyChat) {
      const replyContent = ReplyAttachment.fromChat(replyChat);
      const template = new AttachmentTemplate(replyContent, text);

      const result = await channel.sendTemplate(template);

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

  const result = await channel.sendText(text);

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

type ConvertResultType = ChatType.Photo | ChatType.Video | ChatType.Text | ChatType.Audio | ChatType.File;
function convertType(mimeType: string): ConvertResultType {
  const [type] = mimeType.split('/');

  switch (type) {
    case 'image': return ChatType.Photo;
    case 'video': return ChatType.Video;
    case 'text': return ChatType.Text;
    case 'audio': return ChatType.Audio;
    default: return ChatType.File;
  }
}
