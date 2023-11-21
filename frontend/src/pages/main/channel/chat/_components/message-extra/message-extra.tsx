import * as styles from './message-extra.css';

export type MessageExtraProps = {
  direction: 'left' | 'right',
  unread?: number,
  time: number,
}

export const MessageExtra = (props: MessageExtraProps) => {
  return <div
    class={styles.container}
    classList={{
      [styles.left]: props.direction === 'left',
      [styles.right]: props.direction === 'right',
    }}
  >
    <span class={styles.unread}>{props.unread ? props.unread : ' '}</span>
    <span class={styles.time}>
      {new Date(props.time).toLocaleTimeString()}
    </span>
  </div>;
};
