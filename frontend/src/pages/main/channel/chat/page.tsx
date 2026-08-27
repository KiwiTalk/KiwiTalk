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
import { useChannel, useChannelMembers, useMessageList } from './_hooks';
import { PendingChatlog } from './_types';

import * as styles from './page.css';
import { ChatFactoryContext } from './_hooks/useChatFactory';
import { ChatFactory } from './_utils/chat-factory';
import { normalChannelReadChat, sendText } from '@/api/client';
import { dispatchSelfEvent } from '../../_utils';

export const ChatPage = () => {
  const isReady = useReady();
  const [t] = useTransContext();
  const params = useParams();
  const channelId = () => params.channelId;
  const channel = useChannel(channelId);
  const members = useChannelMembers(channelId);
  const [
    messageGroups,
    {
      load: loadMoreMessages,
      trySend,
      retryPending,
      cancelPending,
    },
    isLoadEnd,
  ] = useMessageList(channelId);

  const [scroller, setScroller] = createSignal<VirtualListRef | null>(null);

  /* defines */
  const channelFactory = createMemo(on(
    channel,
    (channel) => channel && new ChatFactory(channel, getOwner()),
  ));

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

    if (start <= 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { // queue this task as last as possible
          scrollToBottom();
        });
      });
    }
  }));

  /* callbacks */
  const scrollToBottom = () => {
    const scrollElement = scroller()?.element;
    if (!scrollElement) return;

    scrollElement.scrollTo({
      top: scrollElement.scrollHeight,
      behavior: 'smooth',
    });
  };
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
  const onSubmit = (text: string) => {
    const senderId = me()?.profile.id;
    if (typeof senderId !== 'string') return;

    dispatchChatlog({
      senderId,
      status: 'pending',
      chatType: 1,
      content: text,
    });
  };

  const dispatchChatlog = async (log: PendingChatlog) => {
    const id = channelId();
    const myId = me()?.profile.id;
    if (typeof id !== 'string' || typeof myId !== 'string') return;

    const { resolve, reject } = trySend(log);
    const result = await (() => {
      switch (log.chatType) {
      case 1:
        return sendText(id, log.content!);
      }
    })()?.catch((e) => {
      reject();
      return Promise.reject(e);
    });
    if (!result) return;

    resolve(result);
    dispatchSelfEvent(id, {
      type: 'Chat',
      content: result,
    });

    if (channel()?.kind === 'normal') {
      normalChannelReadChat(id, result.logId).then(() => {
        dispatchSelfEvent(id, {
          type: 'ChatRead',
          content: {
            userId: myId,
            logId: result.logId,
          },
        });
      });
    }

    scrollToBottom();
  };

  const onRetryPending = (log: PendingChatlog) => {
    const id = channelId();
    const myId = me()?.profile.id;
    if (typeof id !== 'string' || typeof myId !== 'string') return;

    retryPending(log);
    dispatchChatlog(log);
  };

  return (
    <div class={styles.container}>
      <Show when={channelId()} fallback={<ChatEmpty />}>
        <ChannelHeader
          name={channelInfo()?.name ?? '...'}
          profile={channelInfo()?.profile?.imageUrl ??
            (channelInfo()?.displayUsers.length === 1 ?
              channelInfo()?.displayUsers[0].profileUrl :
              undefined)}
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
            onRetryPending={onRetryPending}
            onCancelPending={cancelPending}
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
