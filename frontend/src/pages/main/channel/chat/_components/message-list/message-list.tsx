import { Accessor, createMemo, createResource, mergeProps, untrack } from 'solid-js';

import { Chatlog, NormalChannelUser, openChannel } from '@/api/client';
import { VirtualList } from '@/ui-common/virtual-list';
import { useReady } from '@/pages/main/_utils';

import * as styles from './message-list.css';
import { Message } from '../message';

export type MessageListViewModelType = (id: string) => {
  messages: Accessor<Chatlog[]>;
  members: Accessor<Record<string, NormalChannelUser>>;
};

const MessageListViewModel: MessageListViewModelType = (id) => {
  const isReady = useReady();

  const [channel] = createResource(isReady, async (ready) => {
    if (!ready) return null;

    return openChannel(id);
  });
  const [members] = createResource(() => channel(), async (target) => {
    if (!target) return {};

    return Object.fromEntries(await target.getUsers() ?? []);
  });

  return {
    messages: () => [] as Chatlog[],
    members: () => members() ?? {},
  };
};

export type MessageListProps = {
  channelId: string;
  logonId?: string
  viewModel?: MessageListViewModelType;
};
export const MessageList = (props: MessageListProps) => {
  const merged = mergeProps({ viewModel: MessageListViewModel }, props);
  const instance = untrack(() => merged.viewModel(props.channelId));

  const messages = createMemo(() => instance.messages());
  const users = createMemo(() => instance.members());

  return (
    <VirtualList
      component={'section'}
      items={messages()}
      class={styles.virtualList.outer}
      innerClass={styles.virtualList.inner}
    >
      {(item) => (
        <Message
          profile={users()[item.senderId]?.profileUrl}
          sender={users()[item.senderId]?.nickname}
          unread={item.referer}
          time={new Date(item.sendAt)}
          isMine={item.senderId === props.logonId}
        >
          {item.content}
        </Message>
      )}
    </VirtualList>
  );
};
