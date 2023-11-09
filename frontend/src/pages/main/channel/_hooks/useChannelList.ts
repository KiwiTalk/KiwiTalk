import { Accessor, createResource } from 'solid-js';

import { getChannelList } from '@/api';
import { useReady, useChannelEvent } from '@/pages/main/_hooks';

import { ChannelListItem } from '../_types';

export const useChannelList = (): Accessor<ChannelListItem[]> => {
  const isReady = useReady();
  const event = useChannelEvent();

  let cached: ChannelListItem[] = [];
  const [channelMap] = createResource(
    () => [isReady(), event()] as const,
    async ([isReady, event]) => {
      if (!isReady) return [];
      if (event?.type !== 'Chat' && cached.length > 0) return cached;

      const result: ChannelListItem[] = [];

      for (const [id, item] of await getChannelList()) {
        result.push({
          id,
          name: item.name ?? item.displayUsers.map((user) => user.nickname).join(', '),
          displayUsers: item.displayUsers,
          lastChat: item.lastChat ? {
            ...item.lastChat,
            timestamp: new Date(item.lastChat.timestamp),
          } : undefined,
          userCount: item.userCount,
          unreadCount: item.unreadCount,
          profile:
            item.profile?.imageUrl ??
            (item.displayUsers.length === 1 ?
              item.displayUsers[0].profileUrl :
              undefined),
          silent: false, // TODO
        });
      }

      cached = result;
      return result;
    },
  );

  return () => channelMap() ?? [];
};
