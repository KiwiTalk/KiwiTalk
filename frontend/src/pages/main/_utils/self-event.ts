import { KiwiTalkChannelEvent } from '@/api';

type KiwiTalkChannelEventWithId = KiwiTalkChannelEvent & { id: string };

let resolver: ((event: KiwiTalkChannelEventWithId | null) => void) | null = null;

export const dispatchSelfEvent = <Event extends KiwiTalkChannelEvent>(
  id: string,
  event: Event,
) => {
  resolver?.({
    id,
    ...event,
  });
};

export function nextEvent(): Promise<KiwiTalkChannelEventWithId | null> {
  return new Promise((resolve) => {
    if (resolver) resolver(null);
    resolver = resolve;
  });
}

export async function* createSelfChannelEventStream(): AsyncGenerator<KiwiTalkChannelEventWithId> {
  let event: KiwiTalkChannelEventWithId | null;

  while (true) {
    event = await nextEvent();

    if (event) yield event;
  }
}
