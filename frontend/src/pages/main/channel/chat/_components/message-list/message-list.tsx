import { JSX, createEffect, createRenderEffect, createSignal, on } from 'solid-js';

import { ChannelUser, Chatlog } from '@/api/client';
import { VirtualList, VirtualListRef } from '@/ui-common/virtual-list';
import { Message } from '../message';

import * as styles from './message-list.css';

const isDiff = (a: number, b: number) => {
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

export type MessageListProps = {
  scroller?: (ref: VirtualListRef) => void;

  channelId: string;
  messages: Chatlog[];
  members: Record<string, ChannelUser>;

  logonId?: string;
  isEnd?: boolean;

  onLoadMore?: () => void;
};
export const MessageList = (props: MessageListProps) => {
  const [isStickBottom, setIsStickBottom] = createSignal(true);

  const getSender = (chat: Chatlog, index: number) => {
    const nextChat = props.messages[index + 1];

    if (nextChat?.senderId !== chat.senderId) return props.members[chat.senderId]?.nickname;
    return undefined;
  };
  const getReadCount = (chat: Chatlog) => {
    const userList = Object.values(props.members);
    const count = userList.filter((user) => BigInt(user.watermark) < BigInt(chat.logId)).length;

    return count > 0 ? count : undefined;
  };
  const getTime = (chat: Chatlog, index: number) => {
    const prevChat = props.messages[index - 1];

    if (prevChat) {
      if (isDiff(prevChat.sendAt, chat.sendAt) || prevChat.senderId !== chat.senderId) {
        return new Date(chat.sendAt * 1000);
      }
    }

    return undefined;
  };

  createRenderEffect(on(() => props.channelId, () => {
    setIsStickBottom(true);
  }));

  createEffect(on(() => props.messages.length, (length) => {
    if (length > 0 && isStickBottom()) {
      requestAnimationFrame(() => {
        setIsStickBottom(false);
      });
    }
  }, { defer: true }));

  let isLoaded = true;
  const onScroll: JSX.EventHandlerUnion<HTMLUListElement, Event> = (event) => {
    if (!props.isEnd && !isLoaded && event.target.scrollTop <= 0) {
      isLoaded = true;
      props.onLoadMore?.();
    }

    if (event.target.scrollTop > 0) {
      isLoaded = false;
    }
  };

  return (
    <VirtualList
      reverse
      component={'ul'}
      ref={props.scroller}
      items={props.messages}
      class={styles.virtualList.outer}
      innerClass={styles.virtualList.inner}
      topMargin={32 + 64 + 16}
      bottomMargin={24 + 44 + 16}
      estimatedItemHeight={75}
      alignToBottom={isStickBottom()}
      onScroll={onScroll}
    >
      {(item, index) => (
        <Message
          profile={props.members[item!.senderId]?.profileUrl}
          sender={getSender(item!, index())}
          unread={getReadCount(item!)}
          time={getTime(item!, index())}
          isMine={item!.senderId === props.logonId}
          isConnected={props.messages[index() - 1]?.senderId === item!.senderId}
        >
          {item!.content}
        </Message>
      )}
    </VirtualList>
  );
};
