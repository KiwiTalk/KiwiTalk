import { For } from 'solid-js';

import { ChannelUser, Chatlog } from '@/api/client';

import * as styles from './message-group.css';
import { Profile } from '@/pages/main/_components/profile';
import { Message } from '../message/message';

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
  const variant = () => props.isMine ? 'mine' : 'other';
  const isLastIndex = (index: number) => index === props.messages.length - 1;
  const isShowTime = (index: number) => {
    if (isLastIndex(index)) return true;

    const current = props.messages[index];
    const next = props.messages[index + 1];

    return isDateDiff(current.sendAt, next.sendAt);
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
        <div class={styles.sender[variant()]}>{props.sender}</div>
        <For each={props.messages}>
          {(message, index) => (
            <Message
              isMine={props.isMine}
              isBubble={message.chatType !== 0}
              isConnected={!isLastIndex(index())}
              time={isShowTime(index()) ? new Date(message.sendAt * 1000) : undefined}
              unread={getUnreadCount(message)}
            >
              {message.content}
            </Message>
          )}
        </For>
      </div>
    </div>
  );
};
