import { Accessor, createEffect, createSignal } from 'solid-js';

import { Channel, loadChannel } from '@/api/client';
import { useReady } from '@/pages/main/_hooks';

export const useChannel = (id: Accessor<string | null>) => {
  const isReady = useReady();
  const [channel, setChannel] = createSignal<Channel | null>(null);

  createEffect(async () => {
    if (!isReady()) return;

    const channelId = id();
    if (typeof channelId !== 'string') return;

    setChannel(await loadChannel(channelId));
  });

  return channel;
};
