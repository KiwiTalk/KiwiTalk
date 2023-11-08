import { Accessor, createEffect, createResource, createSignal, on } from 'solid-js';

import { Chatlog, loadChat } from '@/api/client';
import { useChannelEvent } from '@/pages/main/_hooks';

export const useMessageList = (channelId: Accessor<string | null>): [
  messageGroups: Accessor<Chatlog[][]>,
  load: (messages?: Chatlog[]) => void,
  isEnd: Accessor<boolean>,
] => {
  let lastLogId: string | undefined = undefined;
  const event = useChannelEvent();

  const [messageGroups, setMessageGroups] = createSignal<Chatlog[][]>([]);
  const [loadMore, setLoadMore] = createSignal(true);
  const [isEnd, setIsEnd] = createSignal(false);

  const appendMessages = (...messages: Chatlog[]) => {
    const result = [...messageGroups().map((group) => [...group])];
    const newGroups = messages.reduce<Chatlog[][]>((acc, cur) => {
      const lastGroup = acc.at(-1);
      if (lastGroup?.at(-1)?.senderId === cur.senderId) {
        lastGroup.push(cur);
      } else {
        acc.push([cur]);
      }

      return acc;
    }, []);

    const isCombine = result.at(-1)?.at(-1)?.senderId === newGroups.at(0)?.at(0)?.senderId;
    if (isCombine) {
      result.at(-1)?.push(...newGroups.shift()!);
    }
    result.push(...newGroups);
    lastLogId = newGroups.at(-1)?.at(-1)?.logId;

    return result;
  };

  const prependMessages = (...messages: Chatlog[]) => {
    const result = [...messageGroups().map((group) => [...group])];
    const newGroups = messages.reduce<Chatlog[][]>((acc, cur) => {
      const firstGroup = acc.at(0);
      if (firstGroup?.at(0)?.senderId === cur.senderId) {
        firstGroup.unshift(cur);
      } else {
        acc.unshift([cur]);
      }

      return acc;
    }, []);

    const isCombine = result.at(0)?.at(0)?.senderId === newGroups.at(-1)?.at(-1)?.senderId;
    if (isCombine) {
      result.at(0)?.unshift(...newGroups.pop()!);
    }
    result.unshift(...newGroups);

    return result;
  };

  createResource(() => [channelId(), loadMore()] as const, async ([id, isLoad]) => {
    if (typeof id !== 'string' || !isLoad) return;

    const newLoaded = await loadChat(id, 300, lastLogId, true) ?? [];
    if (newLoaded.length === 0) {
      setIsEnd(true);
    } else {
      const newGroups = appendMessages(...newLoaded);

      lastLogId = newGroups.at(-1)?.at(-1)?.logId;

      setMessageGroups(newGroups);
    }

    setLoadMore(false);
  });

  createEffect(on(channelId, () => {
    lastLogId = undefined;

    setMessageGroups([]);
    setLoadMore(true);
  }));

  createEffect(on(event, async (event) => {
    if (event?.type === 'chat') {
      const id = channelId();

      if (event.channelId === id) {
        const newLoaded = await loadChat(id, 1);

        setMessageGroups(prependMessages(...newLoaded));
      }
    }
  }));

  const onLoadMore = (newMessages: Chatlog[] | undefined = undefined) => {
    if (newMessages) setMessageGroups(prependMessages(...newMessages));
    else setLoadMore(true);
  };

  return [messageGroups, onLoadMore, isEnd];
};
