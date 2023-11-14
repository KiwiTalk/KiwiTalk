import {
  ParentProps,
} from 'solid-js';

import * as styles from './message-group.css';

export type UserMessageGroupProps = ParentProps<{
  profileImageUrl?: string,
  nickname: string,
}>;

export const UserMessageGroup = (props: UserMessageGroupProps) => {
  return (
    <div class={styles.container}>
      <img class={styles.profile} src={props.profileImageUrl} />
      <div class={styles.messageContainer}>
        <span class={styles.nickname}>{props.nickname}</span>
        {props.children}
      </div>
    </div>
  );
};

export type ClientMessageGroupProps = ParentProps<{
  profileImageUrl?: string,
}>;

export const ClientMessageGroup = (props: ClientMessageGroupProps) => {
  return (
    <div class={styles.container}>
      <div class={styles.messageContainer}>
        {props.children}
      </div>
      <img class={styles.profile} src={props.profileImageUrl} />
    </div>
  );
};
