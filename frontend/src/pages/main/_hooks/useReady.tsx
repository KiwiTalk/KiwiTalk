import {
  Accessor,
  ParentProps,
  createContext,
  createResource,
  createSignal,
  useContext,
} from 'solid-js';


import { created, create, createMainEventStream } from '@/api/client/client';
import { KiwiTalkEvent, LogoutReason } from '@/api';

const ReadyContext = createContext<Accessor<boolean>>(() => false);
export const useReady = () => useContext(ReadyContext);

export type ReadyProviderProps = ParentProps<{
  onReady?: () => void;
  onLogout?: (reason: LogoutReason) => void;
  onEvent?: (event: KiwiTalkEvent) => void;
}>;
export const ReadyProvider = (props: ReadyProviderProps) => {
  const [isReady, setIsReady] = createSignal(false);
  let finished = false;

  createResource(async () => {
    if (!await created()) {
      await create('Unlocked');
    }
    setIsReady(true);
    props.onReady?.();

    const stream = createMainEventStream();

    try {
      for await (const event of stream) {
        if (event.type === 'kickout') {
          props.onLogout?.({ type: 'Kickout', reasonId: event.content.reason });
          finished = true;
          return;
        }

        props.onEvent?.(event);
      }

      if (finished) return;

      props.onLogout?.({ type: 'Disconnected' });
    } catch (err) {
      props.onLogout?.({ type: 'Error', err });
    } finally {
      finished = true;
    }
  });

  return (
    <ReadyContext.Provider value={isReady}>
      {props.children}
    </ReadyContext.Provider>
  );
};
