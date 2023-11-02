import { Accessor, createEffect, createSignal, onCleanup, untrack } from 'solid-js';

import { ClientChannel, openChannel } from '@/api/client';
import { useReady } from '@/pages/main/_hooks';

export const useChannel = (id: Accessor<string | null>) => {
  const isReady = useReady();
  const [channel, setChannel] = createSignal<ClientChannel | null>(null);

  createEffect(async () => {
    if (!isReady()) return;

    const channelId = id();
    if (typeof channelId !== 'string') return;

    const oldChannel = untrack(() => channel());
    if (oldChannel) oldChannel.close();

    setChannel(await openChannel(channelId));
  });

  onCleanup(() => {
    const oldChannel = channel();

    if (oldChannel) oldChannel.close();
  });

  return channel;
};
