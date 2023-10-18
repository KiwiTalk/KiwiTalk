import { Accessor, For, createResource, mergeProps, untrack, JSX, splitProps } from 'solid-js';

import * as styles from './channel-list.css';
import { getChannelList } from '@/ipc/client';
import { ChannelItem } from '../channel-item';

import IconSearch from '@/assets/icons/search.svg';
import IconAddChat from '@/pages/main/channel/_assets/icons/add-chat.svg';

import type { ChannelListItem } from '@/pages/main/channel/_types';
import { useTransContext } from '@jellybrick/solid-i18next';

export type ChannelListIconProps = {
  icon: JSX.Element;
  onClick?: () => void;
};
const ChannelListIcon = (props: ChannelListIconProps) => (
  <button
    type={'button'}
    class={styles.iconButton}
    onClick={props.onClick}
  >
    {props.icon}
  </button>
);

type ClickableChannelListTopItem = {
  kind: 'click';
  icon: JSX.Element;
  onClick?: () => void;
};
type CustomChannelListTopItem = {
  kind: 'custom';
  icon: JSX.Element;
  custom: JSX.Element;
};
type ChannelListTopItem = ClickableChannelListTopItem | CustomChannelListTopItem;
export type ChannelListViewModelType = () => {
  channels: Accessor<ChannelListItem[]>;
  topItems: () => ChannelListTopItem[];
};

export const ChannelListViewModel: ChannelListViewModelType = () => {
  const [channelMap] = createResource(async () => {
    const result: ChannelListItem[] = [];

    for (const [id, item] of await getChannelList()) {
      result.push({
        id,
        name: item.name ?? item.displayUsers.map((user) => user.nickname).join(', '),
        displayUsers: item.displayUsers,
        lastChat: item.lastChat ? {
          ...item.lastChat,
          content: {
            ...item.lastChat.content,
            timestamp: new Date(), // TODO: add timestamp in the backend
          },
        } : undefined,
        userCount: item.userCount,
        unreadCount: item.unreadCount,
        profile: item.profile,
        silent: false, // TODO
      });
    }

    return result;
  });

  return {
    channels: (() => channelMap() ?? []),
    topItems: () => [
      {
        kind: 'click', // TODO: change to 'custom' when new design created
        icon: <IconSearch />,
      },
      {
        kind: 'click',
        icon: <IconAddChat />,
      },
    ],
  };
};


export type ChannelListProps = {
  viewModel: ChannelListViewModelType;
  activeId?: string;
  setActiveId?: (id: string) => void;
}
export const ChannelList = (props: ChannelListProps) => {
  const [local] = splitProps(props, ['activeId', 'setActiveId']);
  const merged = mergeProps({ viewModel: ChannelListViewModel }, props);
  const instance = untrack(() => merged.viewModel());
  const [t] = useTransContext();

  return (
    <ul class={styles.container}>
      <header class={styles.header}>
        <span class={styles.title}>
          {t('main.menu.chat.name')}
        </span>
        <div class={styles.iconContainer}>
          <For each={instance.topItems()}>
            {(item) => (
              <ChannelListIcon
                icon={item.icon}
                onClick={item.kind === 'click' ? item.onClick : undefined}
              />
            )}
          </For>
        </div>
      </header>
      <For each={instance.channels()}>
        {(channel) => (
          <ChannelItem
            name={channel.name}
            members={channel.userCount}
            lastMessage={channel.lastChat?.content.message}
            lastMessageTime={channel.lastChat?.content.timestamp}
            profileSrc={channel.profile}
            unreadBadge={channel.unreadCount}
            silent={channel.silent}
            selected={channel.id === local.activeId}
            onClick={() => local.setActiveId?.(channel.id)}
          />
        )}
      </For>
    </ul>
  );
};
