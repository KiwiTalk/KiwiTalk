import { KiwiTalkClientEvent, nextClientEvent } from '../ipc/client';

export async function* createClientSession(): AsyncGenerator<KiwiTalkClientEvent> {
  let nextEvent: KiwiTalkClientEvent | void;

  while ((nextEvent = await nextClientEvent())) {
    yield nextEvent;
  }
}
