import {
  Accessor,
  createEffect,
  createResource,
  createSignal,
  mergeProps,
  on,
  untrack,
} from 'solid-js';

import { Chatlog, NormalChannelUser, openChannel } from '@/api/client';
import { VirtualList } from '@/ui-common/virtual-list';
import { useReady } from '@/pages/main/_utils';

import * as styles from './message-list.css';
import { Message } from '../message';
import { useEvent } from '@/pages/main/_utils/useEvent';

export type MessageListViewModelType = (id: string) => {
  messages: Accessor<Chatlog[]>;
  members: Accessor<Record<string, NormalChannelUser>>;
};

export const MessageListViewModel: MessageListViewModelType = (id) => {
  const isReady = useReady();
  const event = useEvent();

  const [loadMore, setLoadMore] = createSignal(true);
  const [messages, setMessages] = createSignal<Chatlog[]>([]);
  let lastLogId: string | undefined = undefined;

  const [channel] = createResource(isReady, async (ready) => {
    if (!ready) return null;

    return openChannel(id);
  });
  const [members] = createResource(() => channel(), async (target) => {
    if (!target) return {};

    return Object.fromEntries(await target.getUsers() ?? []);
  });

  createResource(() => [channel(), loadMore()] as const, async ([target, isLoad]) => {
    if (!target) return;
    if (!isLoad) return;

    const newLoaded = await target.loadChat(50, lastLogId) ?? [];

    const result = [...messages(), ...newLoaded].reverse();
    lastLogId = result.at(-1)?.logId;

    setMessages(result);
    setLoadMore(false);
  });

  createEffect(on(event, (event) => {
    if (event?.type === 'chat') {
      const newMessage = event.content;

      if (newMessage.channel === id) {
        channel()?.loadChat(1).then((newLoaded) => {
          const result = [...messages(), ...newLoaded];

          setMessages(result);
        });
      }
    }
  }));

  return {
    messages,
    loadMore: () => setLoadMore(true),
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
  const [instance, setInstance] = createSignal(untrack(() => merged.viewModel(props.channelId)));

  const messages = () => instance().messages();
  const users = () => instance().members();

  createEffect(on(() => props.channelId, () => {
    setInstance(merged.viewModel(props.channelId));
  }, { defer: true }));

  return (
    <VirtualList
      component={'section'}
      items={messages()}
      class={styles.virtualList.outer}
      innerClass={styles.virtualList.inner}
      topMargin={32}
      bottomMargin={32}
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
          time={new Date(item.sendAt)}
          isMine={item.senderId === props.logonId}
          isConnected={messages()[index() + 1]?.senderId === item.senderId}
        >
          {item.content}
        </Message>
      )}
    </VirtualList>
  );
};
