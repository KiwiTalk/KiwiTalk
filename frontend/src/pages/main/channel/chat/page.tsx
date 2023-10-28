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
import { useTransContext } from '@jellybrick/solid-i18next';

import { VirtualListRef } from '@/ui-common/virtual-list';
import { MessageList } from './_components/message-list';
import { MessageInput } from './_components/message-input';
import { ChannelHeader } from '../_components/channel-header';

import { getChannelList, meProfile } from '@/api';
import { Chatlog, openChannel } from '@/api/client';
import { useReady, useEvent } from '@/pages/main/_utils';

import * as styles from './page.css';

const createMessageListViewModel = (id: string) => {
  const isReady = useReady();
  const event = useEvent();

  const [loadMore, setLoadMore] = createSignal(true);
  const [messages, setMessages] = createSignal<Chatlog[]>([]);
  let lastLogId: string | undefined = undefined;

  /* resources */
  const [channel] = createResource(() => [isReady(), id] as const, async ([ready, id]) => {
    if (!ready) return null;
    if (!id) return null;

    return openChannel(id);
  });
  const [members] = createResource(() => channel(), async (target) => {
    if (!target) return {};

    return Object.fromEntries(await target.getUsers() ?? []);
  });

  /* infinite message loader */
  createResource(() => [channel(), loadMore()] as const, async ([target, isLoad]) => {
    if (!target || !isLoad) return;

    const newLoaded = await target.loadChat(300, lastLogId, true) ?? [];

    const result = [...messages(), ...newLoaded];
    lastLogId = result.at(-1)?.logId;

    setMessages(result);
    setLoadMore(false);
  });

  const onClose = () => {
    channel()?.close();
  };

  /* lifecycle */
  // listen message event
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

  // close channel on unmount
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

  /* resources */
  const [me] = createResource(isReady, async (ready) => {
    if (!ready) return null;

    return meProfile();
  });
  const [channel] = createResource(() => [isReady(), channelId()] as const, async ([ready, id]) => {
    if (!ready || !id) return null;

    const channelMap = Object.fromEntries(await getChannelList());

    return channelMap[id];
  });

  /* lifecycle */
  // Create ViewModel
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

  // Auto Scroll
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

  return (
    <div class={styles.container}>
      <ChannelHeader
        name={channel()?.name ?? '...'}
        profile={channel()?.profile}
        members={channel()?.userCount ?? 0}
      />
      <Show keyed when={channelId() && viewModel()}>
        <MessageList
          scroller={setScroller}
          channelId={channelId()!}
          logonId={me()?.profile.id}
          viewModel={() => ({
            messages: viewModel()!.messages,
            members: viewModel()!.members,
            loadMore: () => {
              const element = scroller()?.element;
              const messageLength = viewModel()!.messages().length;

              if (!element) return;
              viewModel()!.loadMore();

              requestAnimationFrame(() => {
                requestAnimationFrame(() => { // queue this task as last as possible
                  scroller()?.scrollToIndex(
                    messageLength - 5, // 5 is overscan
                    { behavior: 'instant' },
                  );
                });
              });
            },
          })}
        />
      </Show>
      <MessageInput
        placeholder={t('main.chat.placeholder')}
        onSubmit={(message) => viewModel()?.sendText(message)}
      />
    </div>
  );
};
