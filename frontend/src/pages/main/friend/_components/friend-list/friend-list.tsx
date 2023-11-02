import { For, JSX, Show } from 'solid-js';
import { useTransContext } from '@jellybrick/solid-i18next';

import { FriendItem } from '../friend-item';

import IconSearch from '@/assets/icons/search.svg';
import IconAddUser from '@/pages/main/friend/_assets/icons/add-user.svg';

import * as styles from './friend-list.css';

import { ScrollArea } from '@/ui-common/scroll-area';
import { FriendProfile, LogonProfile } from '@/api';

export type FriendListIconProps = {
  icon: JSX.Element;
  onClick?: () => void;
};
const FriendListIcon = (props: FriendListIconProps) => (
  <button
    type={'button'}
    class={styles.iconButton}
    onClick={props.onClick}
  >
    {props.icon}
  </button>
);

type FriendListSectionTitleProps = {
  title: string;
  count?: number;
};
const FriendSectionTitle = (props: FriendListSectionTitleProps) => (
  <div class={styles.sectionTitleContainer}>
    <span class={styles.sectionTitle.title}>
      {props.title}
    </span>
    <Show when={typeof props.count === 'number'}>
      <span class={styles.sectionTitle.number}>
        {props.count}
      </span>
    </Show>
  </div>
);

export type FriendListProps = {
  me?: LogonProfile;

  all?: FriendProfile[];
  pinned?: FriendProfile[];
  nearBirthday?: FriendProfile[];
}
export const FriendList = (props: FriendListProps) => {
  const [t] = useTransContext();

  return (
    <div class={styles.container}>
      <header class={styles.header}>
        <span class={styles.title}>
          {t('main.menu.friend.name')}
        </span>
        <div class={styles.iconContainer}>
          <FriendListIcon
            icon={<IconSearch />}
          />
          <FriendListIcon
            icon={<IconAddUser />}
          />
        </div>
      </header>
      <ScrollArea component={'div'} edgeSize={12}>
        <FriendSectionTitle title={t('main.friend.me')} />
        <Show keyed when={props.me}>
          {(myProfile) => (
            <div class={styles.meFrame}>
              <FriendItem
                name={myProfile.nickname}
                profile={myProfile.profile.profileUrl}
                description={myProfile.profile.statusMessage}
              />
            </div>
          )}
        </Show>
        <FriendSectionTitle
          title={t('main.friend.near_birthday_friends')}
          count={props.nearBirthday?.length ?? 0}
        />
        <div class={styles.sectionContainer.horizontalWrapper}>
          <ScrollArea component={'ul'} class={styles.sectionContainer.horizontal} edgeSize={8}>
            <For each={props.nearBirthday}>
              {(item) => (
                <FriendItem
                  name={item.nickname}
                  profile={item.profileImageUrl}
                  description={'Birthday' /* TODO: implement */}
                  collapsed
                />
              )}
            </For>
          </ScrollArea>
        </div>
        <FriendSectionTitle
          title={t('main.friend.pinned_friends')}
          count={props.pinned?.length}
        />
        <ul class={styles.sectionContainer.vertical}>
          <For each={props.pinned}>
            {(item) => (
              <FriendItem
                name={item.nickname}
                profile={item.profileImageUrl}
                description={item.statusMessage}
              />
            )}
          </For>
        </ul>
        <FriendSectionTitle
          title={t('main.friend.all_friends')}
          count={props.all?.length}
        />
        <ul class={styles.sectionContainer.vertical}>
          <For each={props.all}>
            {(item) => (
              <FriendItem
                name={item.nickname}
                profile={item.profileImageUrl}
                description={item.statusMessage}
              />
            )}
          </For>
        </ul>
      </ScrollArea>
    </div>
  );
};
