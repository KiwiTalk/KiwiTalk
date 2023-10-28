import { Accessor, Show, createMemo, untrack } from 'solid-js';
import { Trans } from '@jellybrick/solid-i18next';

import { Chatlog, NormalChannelUser } from '@/api/client';
import { VirtualList, VirtualListRef } from '@/ui-common/virtual-list';
import { Message } from '../message';

import * as styles from './message-list.css';

export type MessageListViewModelType = () => {
  messages: Accessor<Chatlog[]>;
  members: Accessor<Record<string, NormalChannelUser>>;
  loadMore: () => void;
};

export type MessageListProps = {
  scroller?: (ref: VirtualListRef) => void;
  logonId?: string
  channelId: string;
  viewModel: MessageListViewModelType;
};
export const MessageList = (props: MessageListProps) => {
  const instance = untrack(() => props.viewModel());

  const items = createMemo<(Chatlog | null)[]>(() => [...instance.messages(), null]);
  const users = createMemo(() => instance.members());

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

  /* property getters */
  const getSender = (chat: Chatlog, index: number) => {
    const nextChat = items()[index + 1];

    if (nextChat?.senderId !== chat.senderId) return users()[chat.senderId]?.nickname;
    return undefined;
  };
  const getReadCount = (chat: Chatlog) => {
    const userList = Object.values(users());
    const count = userList.filter((user) => BigInt(user.watermark) < BigInt(chat.logId)).length;

    return count > 0 ? count : undefined;
  };
  const getTime = (chat: Chatlog, index: number) => {
    const prevChat = items()[index - 1];

    if (
      prevChat &&
      (isDiff(prevChat.sendAt, chat.sendAt) || prevChat.senderId !== chat.senderId)
    ) {
      return new Date(chat.sendAt * 1000);
    }

    return undefined;
  };

  /* loader */
  let loadCooldown: number | null = null;
  const onLoad = () => {
    if (typeof loadCooldown === 'number') return;

    instance.loadMore();
    loadCooldown = window.setTimeout(() => {
      loadCooldown = null;
    }, 500);
  };

  return (
    <VirtualList
      reverse
      ref={props.scroller}
      items={items()}
      class={styles.virtualList.outer}
      innerClass={styles.virtualList.inner}
      topMargin={32 + 64 + 16}
      bottomMargin={24 + 44 + 16}
      estimatedItemHeight={75}
    >
      {(item, index) => {
        return (
          <Show
            when={item}
            fallback={
              <div
                ref={onLoad}
                class={styles.loader}
              >
                <Trans key={'main.chat.first_chat'} />
              </div>
            }
          >
            <Message
              profile={users()[item!.senderId]?.profileUrl}
              sender={getSender(item!, index())}
              unread={getReadCount(item!)}
              time={getTime(item!, index())}
              isMine={item!.senderId === props.logonId}
              isConnected={items()[index() - 1]?.senderId === item!.senderId}
            >
              {item!.content}
            </Message>
          </Show>
        );
      }}
    </VirtualList>
  );
};
