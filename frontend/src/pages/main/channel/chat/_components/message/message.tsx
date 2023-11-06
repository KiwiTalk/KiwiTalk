import { mergeProps, JSX, Show } from 'solid-js';

import * as styles from './message.css';

export type MessageProps = {
  unread?: number;
  time?: number;
  isMine?: boolean;
  isBubble?: boolean;
  isConnected?: boolean;

  children?: JSX.Element;
};
export const Message = (props: MessageProps) => {
  const merged = mergeProps({
    isBubble: true,
    isMine: false,
    isConnected: false,
  }, props);

  const variant = () => merged.isMine ? 'mine' : 'other';
  const time = () => typeof merged.time === 'number' ?
    new Date(merged.time * 1000).toLocaleTimeString() :
    undefined;

  return (
    <li class={styles.container[variant()]}>
      <div class={styles.contentContainer}>
        <Show when={merged.isBubble} fallback={merged.children}>
          <div
            class={
              merged.isConnected ?
                styles.bubble[`${variant()}Connected`] :
                styles.bubble[variant()]
            }
          >
            {merged.children}
          </div>
        </Show>
      </div>
      <div class={styles.infoContainer[variant()]}>
        <span class={styles.unread}>{merged.unread}</span>
        <span class={styles.time}>{time()}</span>
      </div>
    </li>
  );
};
