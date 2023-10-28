import { KiwiTalkMainEvent } from '@/api';
import { createContext, createSignal, onCleanup, onMount, useContext } from 'solid-js';

type EventContextType = {
  addEvent: (listener: (event: KiwiTalkMainEvent) => void) => void;
  removeEvent: (listener: (event: KiwiTalkMainEvent) => void) => void;
};
export const EventContext = createContext<EventContextType>();

export const useEvent = () => {
  const context = useContext(EventContext);
  const [event, setEvent] = createSignal<KiwiTalkMainEvent | null>(null);

  const listener = (event: KiwiTalkMainEvent) => {
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
