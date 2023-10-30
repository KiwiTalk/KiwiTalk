import { Match, Switch } from 'solid-js';

import { ReplyMessage } from './reply-message';
import { UnknownMessage } from './unknown-message';

import { useLocalChannel } from '@/pages/main/channel/chat/_hooks';

import { Chatlog } from '@/api/client';
import { TextMessage } from './text-message';
import { ImageMessage } from './image-message';
import { AttachmentMessage } from './attachment-message';

export type TypedMessageProps = {
  type: number;
  chatlog: Chatlog;
}
export const TypedMessage = (props: TypedMessageProps) => {
  const { members } = useLocalChannel();

  const attachmentJson = (): Record<string, unknown> | null => {
    try {
      return JSON.parse(props.chatlog.attachment ?? '{}');
    } catch {
      return null;
    }
  };

  return (
    <Switch fallback={<UnknownMessage type={props.type} />}>
      <Match when={props.type === 0}> {/* Feed */}
        {props.chatlog.content}
      </Match>
      <Match when={props.type === 1}> {/* Text */}
        <TextMessage
          content={props.chatlog.content}
          isLong={attachmentJson()?.path?.toString()?.includes('.txt')}
        />
      </Match>
      <Match when={props.type === 2}> {/* Single Image: TODO replace fallback  */}
        <ImageMessage
          url={attachmentJson()?.url?.toString()}
        />
      </Match>
      <Match when={props.type === 18}> {/* Attachment */}
        <AttachmentMessage
          mimeType={attachmentJson()?.mime?.toString() ?? ''}
          fileName={attachmentJson()?.name?.toString() ?? 'unknown'}
          fileSize={Number(attachmentJson()?.size ?? 0)}
          expire={Number(attachmentJson()?.expire ?? 0)}
        />
      </Match>
      <Match when={props.type === 26}> {/* Reply */}
        <ReplyMessage
          content={props.chatlog.content}
          replyContent={attachmentJson()?.src_message?.toString()}
          replySender={members()[attachmentJson()?.src_userId?.toString() ?? '']?.nickname}
        />
      </Match>
    </Switch>
  );
};
