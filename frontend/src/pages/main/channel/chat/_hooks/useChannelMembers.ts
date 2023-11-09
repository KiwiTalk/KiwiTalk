import { Accessor, createEffect, createSignal, on } from 'solid-js';

import { NormalChannelUser } from '@/api/client';

import { useChannel } from './useChannel';
import { useChannelEvent } from '@/pages/main/_hooks';

export const useChannelMembers = (channelId: Accessor<string | null>) => {
  const channel = useChannel(channelId);
  const event = useChannelEvent();

  const [members, setMembers] = createSignal<Record<string, NormalChannelUser>>({});

  createEffect(on(channel, (channel) => {
    if (channel?.kind === 'normal') {
      setMembers(Object.fromEntries(channel.content.users));
    }
  }));

  createEffect(on(event, (e) => {
    if (!e || e.channelId !== channelId()) return;

    if (e.type === 'Chat') {
      const { senderId: userId, logId } = e.content;

      setMembers((members) => {
        const result = { ...members };

        if (result[userId]) result[userId].watermark = logId;

        return result;
      });
    }

    if (e.type === 'ChatRead') {
      const { logId, userId } = e.content;

      setMembers((members) => {
        const result = { ...members };

        if (result[userId]) result[userId].watermark = logId;

        return result;
      });
    }
  }));

  return members;
};
