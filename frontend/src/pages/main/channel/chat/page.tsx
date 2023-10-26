import {
  Show,
  createEffect,
  createReaction,
  createResource,
  createSignal,
  on,
  onCleanup,
  untrack,
} from 'solid-js';
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
import { VirtualListRef } from '@/ui-common/virtual-list';

const createMessageListViewModel = (id: string) => {
  const isReady = useReady();
  const event = useEvent();

  const [loadMore, setLoadMore] = createSignal(true);
  const [messages, setMessages] = createSignal<Chatlog[]>([]);
  let lastLogId: string | undefined = undefined;

  const [channel] = createResource(() => [isReady(), id] as const, async ([ready, id]) => {
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

    const newLoaded = await target.loadChat(50, lastLogId, true) ?? [];

    const result = [...messages(), ...newLoaded];
    lastLogId = result.at(-1)?.logId;

    setMessages(result);
    setLoadMore(false);
  });

  const onClose = () => {
    channel()?.close();
  };

  createEffect(on(event, (event) => {
    if (event?.type === 'chat') {
      const newMessage = event.content;

      if (newMessage.channel === id) {
        channel()?.loadChat(1).then((newLoaded) => {
          setMessages([...newLoaded, ...messages()]);
        });
      }
    }
  }));

  onCleanup(() => {
    onClose();
  });

  return {
    messages,
    members: () => members() ?? {},
    loadMore: () => setLoadMore(true),
    channel: () => channel(),
    sendText: async (message: string) => {
      if (!channel()) return;
      const chatLog = await channel()!.sendText(message);

      setMessages([chatLog, ...messages()]);
    },
    onClose,
  };
};

export const ChatPage = () => {
  const params = useParams();
  const isReady = useReady();
  const [t] = useTransContext();
  const channelId = () => params.channelId;

  const [scroller, setScroller] = createSignal<VirtualListRef | null>(null);
  const [viewModel, setViewModel] = createSignal<
    ReturnType<typeof createMessageListViewModel> |
    null
  >(null);

  const [me] = createResource(async () => {
    if (!isReady) return null;

    return meProfile();
  });

  createEffect(() => {
    const id = channelId();

    untrack(() => {
      const newViewModel = createMessageListViewModel(id);
      setViewModel(newViewModel);

      const track = createReaction(() => {
        requestAnimationFrame(() => {
          scroller()?.scrollToIndex(0);
        });
      });

      track(() => newViewModel.messages());
    });
  });

  let lastLogId = '';
  createEffect(on(() => viewModel()?.messages(), (messages) => {
    if (messages?.[0]?.logId === lastLogId) return;
    lastLogId = messages?.[0]?.logId ?? '';

    const range = scroller()?.range() ?? [0, 0];

    if (range[1] >= messages!.length) {
      requestAnimationFrame(() => {
        scroller()?.scrollToIndex(0, { top: 24 + 44 + 16, behavior: 'smooth' });
      });
    }
  }));

  const onSubmit = async (message: string) => {
    await viewModel()?.sendText(message);
  };

  return (
    <div class={styles.container}>
      <ChannelHeader />
      <Show keyed when={channelId() && viewModel()}>
        <MessageList
          scroller={setScroller}
          channelId={channelId()!}
          logonId={me()?.profile.id}
          viewModel={() => ({
            messages: viewModel()!.messages,
            members: viewModel()!.members,
            loadMore: viewModel()!.loadMore,
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
