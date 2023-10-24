import { Accessor, For, createResource, mergeProps, untrack, JSX, Show } from 'solid-js';
import { useTransContext } from '@jellybrick/solid-i18next';

import { FriendItem } from '../friend-item';
import { useReady } from '@/pages/main/_utils';

import IconSearch from '@/assets/icons/search.svg';
import IconAddUser from '@/pages/main/friend/_assets/icons/add-user.svg';

import * as styles from './friend-list.css';

import { ScrollArea } from '@/ui-common/scroll-area';
import { FriendProfile, LogonProfile, meProfile, updateFriends } from '@/api';

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

type ClickableFriendListTopItem = {
  kind: 'click';
  icon: JSX.Element;
  onClick?: () => void;
};
type CustomFriendListTopItem = {
  kind: 'custom';
  icon: JSX.Element;
  custom: JSX.Element;
};
type FriendListTopItem = ClickableFriendListTopItem | CustomFriendListTopItem;
export type FriendListViewModelType = () => {
  me: Accessor<LogonProfile | null>;

  all: Accessor<FriendProfile[]>;
  pinned: Accessor<FriendProfile[]>;
  nearBirthday: Accessor<FriendProfile[]>;

  topItems: () => FriendListTopItem[];
};

export const FriendListViewModel: FriendListViewModelType = () => {
  const isReady = useReady();

  const [me] = createResource(async () => {
    if (!isReady) return null;

    return meProfile();
  });

  const [friends] = createResource([] as FriendProfile[], async (list) => {
    if (!isReady) return list;

    const res = await updateFriends(list.map((friend) => friend.userId));

    for (const removed of res.removedIds) {
      const index = list.findIndex((friend) => friend.userId === removed);
      list.splice(index, 1);
    }

    for (const added of res.added) {
      list.push(added);
    }

    return list;
  });

  return {
    me: () => me() ?? null,
    all: (() => friends() ?? []),
    pinned: () => [], // TODO: implement
    nearBirthday: () => [], // TODO: implement
    topItems: () => [
      {
        kind: 'click', // TODO: change to 'custom' when new design created
        icon: <IconSearch />,
      },
      {
        kind: 'click',
        icon: <IconAddUser />,
      },
    ],
  };
};

export type FriendListProps = {
  viewModel?: FriendListViewModelType;
}
export const FriendList = (props: FriendListProps) => {
  const merged = mergeProps({ viewModel: FriendListViewModel }, props);
  const instance = untrack(() => merged.viewModel());
  const [t] = useTransContext();

  return (
    <div class={styles.container}>
      <header class={styles.header}>
        <span class={styles.title}>
          {t('main.menu.friend.name')}
        </span>
        <div class={styles.iconContainer}>
          <For each={instance.topItems()}>
            {(item) => (
              <FriendListIcon
                icon={item.icon}
                onClick={item.kind === 'click' ? item.onClick : undefined}
              />
            )}
          </For>
        </div>
      </header>
      <ScrollArea component={'div'} edgeSize={12}>
        <FriendSectionTitle title={t('main.friend.me')} />
        <Show when={instance.me()}>
          <div class={styles.meFrame}>
            <FriendItem
              name={instance.me()!.nickname}
              profile={instance.me()!.profile.profileUrl}
              description={instance.me()!.profile.statusMessage}
            />
          </div>
        </Show>
        <FriendSectionTitle
          title={t('main.friend.near_birthday_friends')}
          count={instance.nearBirthday().length}
        />
        <div class={styles.sectionContainer.horizontalWrapper}>
          <ScrollArea component={'ul'} class={styles.sectionContainer.horizontal} edgeSize={8}>
            <For each={instance.nearBirthday()}>
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
          count={instance.pinned().length}
        />
        <ul class={styles.sectionContainer.vertical}>
          <For each={instance.pinned()}>
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
          count={instance.all().length}
        />
        <ul class={styles.sectionContainer.vertical}>
          <For each={instance.all()}>
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
