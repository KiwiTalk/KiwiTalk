import {
  Accessor,
  batch,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  on,
  untrack,
} from 'solid-js';

import { Chatlog, loadChat } from '@/api/client';
import { useChannelEvent } from '@/pages/main/_hooks';
import { ChatlogBase, PendingChatlog } from '../_types';

const pendingLogMap = new Map<string, PendingChatlog[]>();

export const useMessageList = (channelId: Accessor<string | null>): [
  messageGroups: Accessor<(ChatlogBase)[][]>,
  {
    load: (messages?: Chatlog[]) => void,
    trySend: (log: PendingChatlog) => {
      resolve: (log: Chatlog) => void,
      reject: () => void,
    },
    retryPending: (log: PendingChatlog) => void,
    cancelPending: (log: PendingChatlog) => void,
  },
  isEnd: Accessor<boolean>,
] => {
  let lastLogId: string | undefined = undefined;
  const event = useChannelEvent();

  const [messageGroups, setMessageGroups] = createSignal<ChatlogBase[][]>([]);
  const [pendingLogs, setPendingLogs] = createSignal<PendingChatlog[]>([]);
  const [loadMore, setLoadMore] = createSignal(true);
  const [isEnd, setIsEnd] = createSignal(false);

  createEffect(() => {
    const id = channelId();
    if (id) setPendingLogs(pendingLogMap.get(id) ?? []);
  });

  createEffect(() => {
    const id = untrack(channelId);
    const logs = pendingLogs();
    if (id) pendingLogMap.set(id, logs);
  });

  const updateLastLogId = (newGroups: ChatlogBase[][]) => {
    const lastLog = newGroups.at(-1)?.at(-1);
    if (lastLog && 'logId' in lastLog) {
      lastLogId = lastLog.logId;
    }
  };

  const appendMessages = (...messages: ChatlogBase[]) => {
    const result = [...messageGroups()];
    const newGroups = messages.reduce<ChatlogBase[][]>((acc, cur) => {
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
      result[result.length - 1] = [...result.at(-1) ?? [], ...newGroups.shift() ?? []];
    }
    result.push(...newGroups);
    updateLastLogId(result);

    return result;
  };

  const prependMessages = (...messages: ChatlogBase[]) => {
    const result = [...messageGroups()];
    const newGroups = messages.reduce<ChatlogBase[][]>((acc, cur) => {
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
      result[0] = [...newGroups.pop() ?? [], ...result.at(-0) ?? []];
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

      updateLastLogId(newGroups);

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
    if (event?.type === 'Chat') {
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

  const trySend = (pendingLog: PendingChatlog) => {
    if (!untrack(pendingLogs).includes(pendingLog)) {
      setPendingLogs([pendingLog, ...untrack(pendingLogs)]);
    }

    return {
      resolve: (actualLog: Chatlog) => {
        batch(() => {
          setMessageGroups(appendMessages(actualLog));
          setPendingLogs(untrack(pendingLogs).filter((log) => log !== pendingLog));
        });
      },
      reject: () => {
        setPendingLogs(untrack(pendingLogs).map<PendingChatlog>((log) => {
          if (log !== pendingLog) return log;
          log.status = 'rejected';
          return log;
        }));
      },
    };
  };

  const retryPending = (pendingLog: PendingChatlog) => {
    setPendingLogs(untrack(pendingLogs).map<PendingChatlog>((log) => {
      if (log !== pendingLog) return log;
      log.status = 'pending';
      return log;
    }));
  };

  const cancelPending = (pendingLog: PendingChatlog) => {
    setPendingLogs(untrack(pendingLogs).filter((log) => log !== pendingLog));
  };

  const messageGroupsWithPendings = createMemo(() => {
    if (messageGroups().length === 0) return [];
    return prependMessages(...pendingLogs());
  });

  return [
    messageGroupsWithPendings,
    {
      load: onLoadMore,
      trySend,
      retryPending,
      cancelPending,
    },
    isEnd,
  ];
};
