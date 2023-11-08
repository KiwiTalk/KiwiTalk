import { createEffect, createSignal, on } from 'solid-js';

import { KiwiTalkChannelEvent } from '@/api';
import { useEvent } from './useEvent';

type KiwiTalkChannelEventWithId = KiwiTalkChannelEvent & { channelId: string };
export const useChannelEvent = () => {
  const [channelEvent, setChannelEvent] = createSignal<KiwiTalkChannelEventWithId | null>(null);
  const event = useEvent();

  createEffect(on(event, (e) => {
    if (e?.type === 'channel') {
      setChannelEvent({
        ...e.content.event,
        channelId: e.content.channel,
      });
    }
  }));

  return channelEvent;
};
