import { ParentProps } from 'solid-js';

import * as styles from './message-bubble.css';

export type MessageBubbleProps = ParentProps<{
  last: boolean,
}>;

export const ClientMessageBubble = (props: MessageBubbleProps) => {
  return <div
    class={styles.clientBubble}
    classList={{
      [styles.clientLast]: props.last,
    }}
  >
    {props.children}
  </div>;
};

export const UserMessageBubble = (props: MessageBubbleProps) => {
  return <div
    class={styles.userBubble}
    classList={{
      [styles.userLast]: props.last,
    }}
  >
    {props.children}
  </div>;
};
