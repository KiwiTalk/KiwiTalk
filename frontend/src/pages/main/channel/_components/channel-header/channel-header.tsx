import { Show } from 'solid-js';
import { Trans } from '@jellybrick/solid-i18next';

import { Profile } from '@/pages/main/_components/profile';
import * as styles from './channel-header.css';

import IconNotificationOff from '@/assets/icons/notification_off.svg';
import IconNotificationOn from '@/assets/icons/notification.svg';
import IconSearch from '@/assets/icons/search.svg';
import IconMenu from '@/assets/icons/menu.svg';


export type ChannelHeaderProps = {
  profile?: string;
  name?: string;
  members?: number;
  silent?: boolean;
};
export const ChannelHeader = (props: ChannelHeaderProps) => {
  return (
    <div class={styles.container}>
      <div class={styles.contentContainer}>
        <Profile src={props.profile} />
        <div class={styles.textContainer}>
          <span class={styles.text.title}>{props.name}</span>
          <span class={styles.text.subtitle}>
            <Trans key={'main.chat.member_count'} options={{ count: props.members }} />
            <span>
              {'•'}
            </span>
            <Show when={props.silent} fallback={<IconNotificationOn />}>
              <IconNotificationOff />
            </Show>
          </span>
        </div>
      </div>
      <div class={styles.toolContainer}>
        <IconSearch />
        <IconMenu />
      </div>
    </div>
  );
};
