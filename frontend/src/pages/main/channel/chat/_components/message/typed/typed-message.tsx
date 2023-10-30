import { Match, Switch } from 'solid-js';

import { ReplyMessage } from './reply-message';
import { UnknownMessage } from './unknown-message';

import { useLocalChannel } from '@/pages/main/channel/chat/_hooks';

import { Chatlog } from '@/api/client';
import { TextMessage } from './text-message';

export type TypedMessageProps = {
  type: number;
  chatlog: Chatlog;
}
export const TypedMessage = (props: TypedMessageProps) => {
  const { channel, members } = useLocalChannel();

  const attachmentJson = (): Record<string, unknown> | null => {
    try {
      return JSON.parse(props.chatlog.attachment ?? '{}');
    } catch {
      return null;
    }
  };
  const contentJson = (): Record<string, unknown> | null => {
    try {
      return JSON.parse(props.chatlog.content ?? '{}');
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
