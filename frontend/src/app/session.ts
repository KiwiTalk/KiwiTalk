import { KiwiTalkClientEvent, nextClientEvent } from '../backend/app';

export async function* createClientSession(): AsyncGenerator<KiwiTalkClientEvent> {
  let nextEvent;
  while ((nextEvent = await nextClientEvent())) {
    yield nextEvent;
  }
}
