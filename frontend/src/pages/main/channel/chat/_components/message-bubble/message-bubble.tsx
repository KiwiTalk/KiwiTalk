import { ParentProps } from 'solid-js';

import * as styles from './message-bubble.css';

export type MessageBubbleProps = ParentProps<{
  owned: boolean,
  last: boolean,
}>;

export const MessageBubble = (props: MessageBubbleProps) => {
  return <div
    class={styles.bubble}
    classList={{
      [styles.mine]: props.owned,
      [styles.others]: !props.owned,
    }}

    data-last={props.last}
  >
    {props.children}
  </div>;
};
