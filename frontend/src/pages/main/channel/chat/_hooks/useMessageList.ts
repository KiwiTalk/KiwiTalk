import { Accessor, createEffect, createResource, createSignal, on } from 'solid-js';

import { Chatlog, ClientChannel } from '@/api/client';
import { useEvent } from '@/pages/main/_hooks';

export const useMessageList = (channel: Accessor<ClientChannel | null>): [
  messages: Accessor<Chatlog[]>,
  load: (messages?: Chatlog[]) => void,
  isEnd: Accessor<boolean>,
] => {
  let lastLogId: string | undefined = undefined;
  const event = useEvent();

  const [messages, setMessages] = createSignal<Chatlog[]>([]);
  const [loadMore, setLoadMore] = createSignal(true);
  const [isEnd, setIsEnd] = createSignal(false);

  createResource(() => [channel(), loadMore()] as const, async ([target, isLoad]) => {
    if (!target || !isLoad) return;

    const newLoaded = await target.loadChat(300, lastLogId, true) ?? [];
    if (newLoaded.length === 0) {
      setIsEnd(true);
    } else {
      const result = [...messages(), ...newLoaded];
      lastLogId = result.at(-1)?.logId;

      setMessages(result);
    }

    setLoadMore(false);
  });

  createEffect(on(channel, () => {
    lastLogId = undefined;

    setMessages([]);
    setLoadMore(true);
  }));

  createEffect(on(event, async (event) => {
    if (event?.type === 'chat') {
      const newMessage = event.content;
      const target = channel();

      if (newMessage.channel === target?.id) {
        const newLoaded = await target?.loadChat(1);
        setMessages([...newLoaded, ...messages()]);
      }
    }
  }));

  const onLoadMore = (newMessages: Chatlog[] | undefined = undefined) => {
    if (newMessages) setMessages([...newMessages, ...messages()]);
    else setLoadMore(true);
  };

  return [messages, onLoadMore, isEnd];
};
