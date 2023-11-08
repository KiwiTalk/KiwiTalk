import { Accessor, createEffect, createSignal } from 'solid-js';

import { Channel, loadChannel } from '@/api/client';
import { useReady } from '@/pages/main/_hooks';

const atomicChannelLoader: [string, Promise<Channel>][] = [];

export const useChannel = (id: Accessor<string | null>) => {
  const isReady = useReady();
  const [channel, setChannel] = createSignal<Channel | null>(null);

  createEffect(async () => {
    if (!isReady()) return;

    const channelId = id();
    if (typeof channelId !== 'string') return;

    const loader = atomicChannelLoader.find(([id]) => id === channelId);
    if (loader) {
      setChannel(await loader[1]);
    } else {
      const promise = loadChannel(channelId);
      atomicChannelLoader.push([channelId, promise]);

      setChannel(await promise);
    }
  });

  return channel;
};
