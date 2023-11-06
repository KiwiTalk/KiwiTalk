import {
  Show,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  getOwner,
  on,
} from 'solid-js';
import { useParams } from '@solidjs/router';
import { useTransContext } from '@jellybrick/solid-i18next';

import { VirtualListRef } from '@/ui-common/virtual-list';
import { ChatEmpty } from './_components/chat-empty';
import { MessageList } from './_components/message-list';
import { MessageInput } from './_components/message-input';
import { ChannelHeader } from '../_components/channel-header';

import { getChannelList, meProfile } from '@/api';
import { useReady } from '@/pages/main/_hooks';
import { useChannel, useMessageList } from './_hooks';

import * as styles from './page.css';
import { ChatFactoryContext } from './_hooks/useChatFactory';
import { ChatFactory } from './_utils/chat-factory';

export const ChatPage = () => {
  const isReady = useReady();
  const params = useParams();
  const [t] = useTransContext();

  const channelId = () => params.channelId;
  const channel = useChannel(channelId);
  const [messageGroups, loadMoreMessages, isLoadEnd] = useMessageList(channel);
  const channelFactory = createMemo(on(
    channel,
    (channel) => channel && new ChatFactory(channel, getOwner()),
  ));

  const [scroller, setScroller] = createSignal<VirtualListRef | null>(null);

  /* resources */
  const [members] = createResource(channel, async (target) => {
    if (!target) return {};

    return Object.fromEntries(await target.getUsers() ?? []);
  });
  const [me] = createResource(isReady, async (ready) => {
    if (!ready) return null;

    return meProfile();
  });
  const [channelInfo] = createResource(
    () => [isReady(), channelId()] as const,
    async ([ready, id]) => {
      if (!ready || !id) return null;

      const channelMap = Object.fromEntries(await getChannelList());

      return channelMap[id];
    },
  );

  /* lifecycle */
  let isInit = false;
  createEffect(on(messageGroups, (messageList) => {
    if (!isInit) {
      isInit = true;
      return;
    }
    if (messageList.length === 0) isInit = false;
    const [start] = scroller()?.range() ?? [0, 0];

    if (start === 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { // queue this task as last as possible
          const scrollElement = scroller()?.element;
          if (!scrollElement) return;

          scrollElement.scrollTo({
            top: scrollElement.scrollHeight,
            behavior: 'smooth',
          });
        });
      });
    }
  }));

  /* callbacks */
  const onLoadMore = () => {
    const messageLength = messageGroups().length;

    loadMoreMessages();
    scroller()?.refresh();

    setTimeout(() => {
      scroller()?.scrollToIndex(
        messageLength,
        {
          top: (32 + 64 + 16),
          behavior: 'instant',
        },
      );
    }, 16 * 1); // next frame
  };
  const onSubmit = async (text: string) => {
    const result = await channel()?.sendText(text);

    if (result) {
      loadMoreMessages([result]);
      scroller()?.scrollToIndex(0, { behavior: 'smooth' });
    }
  };

  return (
    <div class={styles.container}>
      <Show when={channelId()} fallback={<ChatEmpty />}>
        <ChannelHeader
          name={channelInfo()?.name ?? '...'}
          profile={channelInfo()?.profile}
          members={channelInfo()?.userCount ?? 0}
        />
        <ChatFactoryContext.Provider value={channelFactory}>
          <MessageList
            scroller={setScroller}
            channelId={channelId()!}
            logonId={me()?.profile.id}
            messageGroups={messageGroups()}
            members={members() ?? {}}
            isEnd={isLoadEnd()}
            onLoadMore={onLoadMore}
          />
        </ChatFactoryContext.Provider>
        <MessageInput
          placeholder={t('main.chat.placeholder')}
          onSubmit={onSubmit}
        />
      </Show>
    </div>
  );
};
