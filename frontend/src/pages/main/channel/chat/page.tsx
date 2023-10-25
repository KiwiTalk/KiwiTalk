import { Accessor, Show, createEffect, createResource, createSignal, on } from 'solid-js';
import { useParams } from '@solidjs/router';

import { MessageList } from './_components/message-list';

import * as styles from './page.css';
import { ChannelHeader } from '../_components/channel-header';
import { MessageInput } from './_components/message-input';
import { meProfile } from '@/api';
import { useReady } from '../../_utils';
import { Chatlog, openChannel } from '@/api/client';
import { useEvent } from '../../_utils/useEvent';
import { useTransContext } from '@jellybrick/solid-i18next';

const createMessageListViewModel = (id: Accessor<string>) => {
  const isReady = useReady();
  const event = useEvent();

  const [loadMore, setLoadMore] = createSignal(true);
  const [messages, setMessages] = createSignal<Chatlog[]>([]);
  let lastLogId: string | undefined = undefined;

  const [channel] = createResource(() => [isReady(), id()] as const, async ([ready, id]) => {
    if (!ready) return null;
    if (!id) return null;

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

      if (newMessage.channel === id()) {
        channel()?.loadChat(1).then((newLoaded) => {
          const result = [...messages(), ...newLoaded];

          setMessages(result);
        });
      }
    }
  }));

  return {
    messages,
    members: () => members() ?? {},
    loadMore: () => setLoadMore(true),
    channel: () => channel(),
    sendText: async (message: string) => {
      if (!channel()) return;
      const chatLog = await channel()!.sendText(message);

      setMessages([...messages(), chatLog]);
    },
  };
};

export const ChatPage = () => {
  const params = useParams();
  const isReady = useReady();
  const [t] = useTransContext();
  const channelId = () => params.channelId;

  const {
    messages: MessageListViewModel,
    members,
    loadMore,
    sendText,
  } = createMessageListViewModel(channelId);

  const [me] = createResource(async () => {
    if (!isReady) return null;

    return meProfile();
  });

  const onSubmit = (message: string) => {
    sendText(message);
  };

  return (
    <div class={styles.container}>
      <ChannelHeader />
      <Show when={channelId()}>
        <MessageList
          channelId={channelId()!}
          logonId={me()?.profile.id}
          viewModel={() => ({
            messages: MessageListViewModel,
            members,
            loadMore,
          })}
        />
      </Show>
      <MessageInput
        placeholder={t('main.chat.placeholder')}
        onSubmit={onSubmit}
      />
    </div>
  );
};
