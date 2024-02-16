import { mergeProps, JSX, Show } from 'solid-js';

import IconRefresh from '@/assets/icons/refresh.svg';
import IconClose from '@/assets/icons/close.svg';

import * as styles from './message.css';

export type MessageProps = {
  unread?: number;
  time?: number;
  isMine?: boolean;
  isBubble?: boolean;
  isConnected?: boolean;
  isRejected?: boolean;

  children?: JSX.Element;

  onRetryPending?: () => void;
  onCancelPending?: () => void;
};
export const Message = (props: MessageProps) => {
  const merged = mergeProps({
    isBubble: true,
    isMine: false,
    isConnected: false,
    isRejected: false,
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
      <Show when={merged.isRejected} fallback={
        <div class={styles.infoContainer[variant()]}>
          <span class={styles.unread}>{merged.unread}</span>
          <span class={styles.time}>{time()}</span>
        </div>
      }>
        <div class={styles.failActionContainer}>
          <button
            class={styles.failAction}
            onClick={merged.onRetryPending}
          >
            <IconRefresh />
          </button>
          <button
            class={styles.failAction}
            onClick={merged.onCancelPending}
          >
            <IconClose />
          </button>
        </div>
      </Show>
    </li>
  );
};
