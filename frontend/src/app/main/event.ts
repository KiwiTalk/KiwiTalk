import { KiwiTalkMainEvent, nextMainEvent } from '../../api/client';

export async function* createMainEventStream(): AsyncGenerator<KiwiTalkMainEvent> {
  let nextEvent: KiwiTalkMainEvent | null;

  while ((nextEvent = await nextMainEvent())) {
    yield nextEvent;
  }
}
