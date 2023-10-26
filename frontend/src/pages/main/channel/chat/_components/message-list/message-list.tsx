import { Accessor, Match, Switch, createMemo, untrack } from 'solid-js';

import { Chatlog, NormalChannelUser } from '@/api/client';
import { VirtualList, VirtualListRef } from '@/ui-common/virtual-list';
import { Message } from '../message';

import * as styles from './message-list.css';
import { classes } from '@/features/theme';

export type MessageListViewModelType = () => {
  messages: Accessor<Chatlog[]>;
  members: Accessor<Record<string, NormalChannelUser>>;
  loadMore: () => void;
};

type ListItem = Chatlog | { type: 'loader' };

export type MessageListProps = {
  scroller?: (ref: VirtualListRef) => void;
  logonId?: string
  channelId: string;
  viewModel: MessageListViewModelType;
};
export const MessageList = (props: MessageListProps) => {
  const instance = untrack(() => props.viewModel());

  const items = createMemo<ListItem[]>(() => [...instance.messages(), { type: 'loader' }]);
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

  return (
    <VirtualList
      reverse
      ref={props.scroller}
      items={items()}
      class={styles.virtualList.outer}
      innerClass={styles.virtualList.inner}
      topMargin={32 + 64 + 16}
      bottomMargin={24 + 44 + 16}
      estimatedItemHeight={65}
    >
      {(item, index) => {
        const chat = item as Chatlog;
        const prevChat = items()[index() - 1] as Chatlog | undefined;
        const nextChat = items()[index() + 1] as Chatlog | undefined;

        return (
          <Switch
            fallback={
              <Message
                profile={users()[chat.senderId]?.profileUrl}
                sender={
                  nextChat?.senderId !== chat.senderId ?
                    users()[chat.senderId]?.nickname :
                    undefined
                }
                unread={chat.referer}
                time={
                  (
                    isDiff(prevChat?.sendAt ?? chat.sendAt, chat.sendAt) ||
                    prevChat?.senderId !== chat.senderId
                  ) ?
                    new Date(chat.sendAt * 1000) :
                    undefined
                }
                isMine={chat.senderId === props.logonId}
                isConnected={prevChat?.senderId === chat.senderId}
              >
                {chat.content}
              </Message>
            }
          >
            <Match when={'type' in item && item.type === 'loader'}>
              <div ref={() => instance.loadMore()} class={classes.typography.body}>
                loading...
              </div>
            </Match>
          </Switch>
        );
      }}
    </VirtualList>
  );
};
