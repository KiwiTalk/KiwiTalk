import { For, Suspense, createResource } from 'solid-js';

import { ChannelUser, Chatlog } from '@/api/client';
import { Profile } from '@/pages/main/_components/profile';
import { Message } from '../message/message';

import * as styles from './message-group.css';
import { useChatFactory } from '../../_hooks/useChatFactory';

const isDateDiff = (a: number, b: number) => {
  const aDate = new Date(a * 1000);
  const bDate = new Date(b * 1000);

  return (
    aDate.getFullYear() !== bDate.getFullYear() ||
    aDate.getMonth() !== bDate.getMonth() ||
    aDate.getDate() !== bDate.getDate() ||
    aDate.getHours() !== bDate.getHours() ||
    aDate.getMinutes() !== bDate.getMinutes()
  );
};

export type MessageGroupProps = {
  profile?: string;
  sender: string;
  isMine: boolean;
  messages: Chatlog[];
  members: ChannelUser[];
};
export const MessageGroup = (props: MessageGroupProps) => {
  const factory = useChatFactory();

  const variant = () => props.isMine ? 'mine' : 'other';
  const isShowTime = (index: number) => {
    if (index === 0) return true;

    const current = props.messages[index];
    const next = props.messages[index + 1];

    if (!current || !next) return false;

    return isDateDiff(current.sendAt, next.sendAt);
  };
  const isBubble = (type: number) => {
    if (type === 0) return false; // feed
    if (type === 2) return false; // single image
    if (type === 27) return false; // multiple image

    return true;
  };

  const getUnreadCount = (chat: Chatlog) => {
    const count = props.members
      .filter((user) => BigInt(user.watermark) < BigInt(chat.logId))
      .length;

    return count > 0 ? count : undefined;
  };

  return (
    <div class={styles.container[variant()]}>
      <Profile src={props.profile} />
      <div class={styles.messageContainer}>
        <For each={props.messages}>
          {(message, index) => {
            const [renderer] = createResource(async () => factory()?.create(message));

            return (
              <Message
                isMine={props.isMine}
                isBubble={isBubble(message.chatType)}
                isConnected={index() !== 0}
                time={isShowTime(index()) ? message.sendAt : undefined}
                unread={getUnreadCount(message)}
              >
                <Suspense fallback={'...'}>
                  {renderer()}
                </Suspense>
              </Message>
            );
          }}
        </For>
        <div class={styles.sender[variant()]}>{props.sender}</div>
      </div>
    </div>
  );
};
