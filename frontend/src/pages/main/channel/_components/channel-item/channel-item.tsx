import { Show } from 'solid-js';

import { Profile } from '@/pages/main/_components/profile';

import * as styles from './channel-item.css';

import NotificationOffIcon from '@/assets/icons/notification_off.svg';

export type ChannelItemProps = {
  name: string;
  members: number;

  lastMessage?: string;
  lastMessageTime?: Date;
  profileSrc?: string;
  unreadBadge?: number;
  silent?: boolean;
  selected?: boolean;

  onClick?: () => void;
};
export const ChannelItem = (props: ChannelItemProps) => {
  return (
    <li
      class={styles.channelItemContainer[props.selected ? 'active' : 'inactive']}
      onClick={props.onClick}
    >
      <Profile src={props.profileSrc} badge={props.unreadBadge} />
      <span class={styles.contentContainer}>
        <div class={styles.header}>
          <span class={styles.title}>
            {props.name}
          </span>
          <Show when={props.members > 0}>
            {props.members}
          </Show>
          <Show when={props.silent}>
            <NotificationOffIcon />
          </Show>
          <span class={styles.time}>
            {props.lastMessageTime?.toLocaleTimeString()}
          </span>
        </div>
        <div class={styles.content}>
          {props.lastMessage || '\u{3000}'}
        </div>
      </span>
    </li>
  );
};
