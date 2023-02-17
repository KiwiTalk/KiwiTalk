import { KiwiTalkClientEvent, nextClientEvent } from '../ipc/app';

export async function* createClientSession(): AsyncGenerator<KiwiTalkClientEvent> {
  let nextEvent;
  while ((nextEvent = await nextClientEvent())) {
    yield nextEvent;
  }
}
