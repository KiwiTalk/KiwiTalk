import { KiwiTalkClientEvent, nextClientEvent } from '../ipc/client';

export async function* createClientSession(): AsyncGenerator<KiwiTalkClientEvent> {
  let nextEvent;
  while ((nextEvent = await nextClientEvent())) {
    yield nextEvent;
  }
}
