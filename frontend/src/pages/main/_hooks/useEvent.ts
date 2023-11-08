import { KiwiTalkEvent } from '@/api';
import { createContext, createSignal, onCleanup, onMount, useContext } from 'solid-js';

type EventContextType = {
  addEvent: (listener: (event: KiwiTalkEvent) => void) => void;
  removeEvent: (listener: (event: KiwiTalkEvent) => void) => void;
};
export const EventContext = createContext<EventContextType>();

export const useEvent = () => {
  const context = useContext(EventContext);
  const [event, setEvent] = createSignal<KiwiTalkEvent | null>(null);

  const listener = (event: KiwiTalkEvent) => {
    setEvent(event);
  };

  onMount(() => {
    context?.addEvent(listener);
  });

  onCleanup(() => {
    context?.removeEvent(listener);
  });

  return event;
};
