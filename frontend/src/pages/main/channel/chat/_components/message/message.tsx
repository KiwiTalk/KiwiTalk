import { mergeProps, JSX, Show } from 'solid-js';

import * as styles from './message.css';
import { Profile } from '@/pages/main/_components/profile';

export type MessageProps = {
  profile?: string;
  sender?: string;

  unread?: number;
  time?: Date;
  isMine?: boolean;
  isBubble?: boolean;

  children?: JSX.Element;
};
export const Message = (props: MessageProps) => {
  const merged = mergeProps({ isBubble: true }, props);

  const variant = () => merged.isMine ? 'mine' : 'other';

  return (
    <li class={styles.container[variant()]}>
      <Show when={merged.profile} fallback={<div class={styles.profile} />}>
        <Profile src={merged.profile} size={'48px'} />
      </Show>
      <div class={styles.contentContainer}>
        <Show when={variant() === 'other' && merged.sender}>
          <span class={styles.sender}>{merged.sender}</span>
        </Show>
        <Show when={merged.isBubble} fallback={merged.children}>
          <div class={styles.bubble[variant()]}>
            {merged.children}
          </div>
        </Show>
      </div>
      <div class={styles.infoContainer[variant()]}>
        <span class={styles.unread}>{merged.unread}</span>
        <span class={styles.time}>{merged.time?.toLocaleTimeString()}</span>
      </div>
    </li>
  );
};
