import {
  Show,
  createEffect,
  createResource,
  createSignal,
  on,
} from 'solid-js';
import { useParams } from '@solidjs/router';
import { useTransContext } from '@jellybrick/solid-i18next';

import { VirtualListRef } from '@/ui-common/virtual-list';
import { MessageList } from './_components/message-list';
import { MessageInput } from './_components/message-input';
import { ChannelHeader } from '../_components/channel-header';

import { getChannelList, meProfile } from '@/api';
import { useReady } from '@/pages/main/_hooks';
import { useChannel, useMessageList } from './_hooks';

import * as styles from './page.css';

export const ChatPage = () => {
  const isReady = useReady();
  const params = useParams();
  const [t] = useTransContext();

  const channelId = () => params.channelId;
  const channel = useChannel(channelId);
  const [messages, loadMoreMessages, isLoadEnd] = useMessageList(channel);

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
  let lastLogId = '';
  createEffect(on(messages, (messages) => {
    if (messages[0]?.logId === lastLogId) return;
    lastLogId = messages?.[0]?.logId ?? '';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scroller()?.scrollToIndex(0, { behavior: 'smooth' });
      });
    });
  }));

  /* callbacks */
  const onLoadMore = () => {
    const messageLength = messages().length;

    loadMoreMessages();
    scroller()?.refresh();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => { // queue this task as last as possible
        scroller()?.scrollToIndex(
          messageLength - 5, // 5 is overscan
          { behavior: 'instant' },
        );
      });
    });
  };
  const onSubmit = async (text: string) => {
    const result = await channel()?.sendText(text);

    if (result) loadMoreMessages([result]);
  };

  return (
    <div class={styles.container}>
      <ChannelHeader
        name={channelInfo()?.name ?? '...'}
        profile={channelInfo()?.profile}
        members={channelInfo()?.userCount ?? 0}
      />
      <Show keyed when={channelId()}>
        <MessageList
          scroller={setScroller}
          channelId={channelId()!}
          logonId={me()?.profile.id}
          messages={messages()}
          members={members() ?? {}}
          isEnd={isLoadEnd()}
          onLoadMore={onLoadMore}
        />
      </Show>
      <MessageInput
        placeholder={t('main.chat.placeholder')}
        onSubmit={onSubmit}
      />
    </div>
  );
};
