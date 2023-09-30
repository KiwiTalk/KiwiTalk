import { KiwiTalkMainEvent, nextMainEvent } from '../../ipc/client';

export async function* createMainEventStream(): AsyncGenerator<KiwiTalkMainEvent> {
  let nextEvent: KiwiTalkMainEvent | null;

  while ((nextEvent = await nextMainEvent())) {
    yield nextEvent;
  }
}
