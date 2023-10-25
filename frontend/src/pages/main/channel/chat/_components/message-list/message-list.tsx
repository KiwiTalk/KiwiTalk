import { Accessor, untrack } from 'solid-js';

import { Chatlog, NormalChannelUser } from '@/api/client';
import { VirtualList } from '@/ui-common/virtual-list';

import * as styles from './message-list.css';
import { Message } from '../message';

export type MessageListViewModelType = () => {
  messages: Accessor<Chatlog[]>;
  members: Accessor<Record<string, NormalChannelUser>>;
};

export type MessageListProps = {
  channelId: string;
  logonId?: string
  viewModel: MessageListViewModelType;
};
export const MessageList = (props: MessageListProps) => {
  const instance = untrack(() => props.viewModel());

  const messages = () => instance.messages();
  const users = () => instance.members();

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
      component={'section'}
      items={messages()}
      class={styles.virtualList.outer}
      innerClass={styles.virtualList.inner}
      topMargin={32 + 64 + 16}
      bottomMargin={24 + 44 + 16}
    >
      {(item, index) => (
        <Message
          profile={users()[item.senderId]?.profileUrl}
          sender={
            messages()[index() - 1]?.senderId !== item.senderId ?
              users()[item.senderId]?.nickname :
              undefined
          }
          unread={item.referer}
          time={
            isDiff(messages()[index() + 1]?.sendAt, item.sendAt) ?
              new Date(item.sendAt * 1000) :
              undefined
          }
          isMine={item.senderId === props.logonId}
          isConnected={messages()[index() + 1]?.senderId === item.senderId}
        >
          {item.content}
        </Message>
      )}
    </VirtualList>
  );
};
