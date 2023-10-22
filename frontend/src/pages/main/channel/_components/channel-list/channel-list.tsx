import { Accessor, For, createResource, mergeProps, untrack, JSX, splitProps } from 'solid-js';
import { useTransContext } from '@jellybrick/solid-i18next';

import { ChannelItem } from '../channel-item';
import { getChannelList } from '@/api/client';
import { useReady } from '@/pages/main/_utils';

import IconSearch from '@/assets/icons/search.svg';
import IconAddChat from '@/pages/main/channel/_assets/icons/add-chat.svg';

import * as styles from './channel-list.css';

import type { ChannelListItem } from '@/pages/main/channel/_types';
import { ScrollArea } from '@/ui-common/scroll-area';

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
  const isReady = useReady();

  const [channelMap] = createResource(isReady, async (isReady) => {
    if (!isReady) return [];

    const result: ChannelListItem[] = [];

    for (const [id, item] of await getChannelList()) {
      result.push({
        id,
        name: item.name ?? item.displayUsers.map((user) => user.nickname).join(', '),
        displayUsers: item.displayUsers,
        lastChat: item.lastChat ? {
          ...item.lastChat,
          timestamp: new Date(item.lastChat.timestamp),
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
  viewModel?: ChannelListViewModelType;
  activeId?: string;
  setActiveId?: (id: string) => void;
}
export const ChannelList = (props: ChannelListProps) => {
  const [local] = splitProps(props, ['activeId', 'setActiveId']);
  const merged = mergeProps({ viewModel: ChannelListViewModel }, props);
  const instance = untrack(() => merged.viewModel());
  const [t] = useTransContext();

  return (
    <div class={styles.container}>
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
      <ScrollArea component={'ul'} edgeSize={12}>
        <For each={instance.channels()}>
          {(channel) => (
            <ChannelItem
              name={channel.name}
              members={channel.userCount}
              lastMessage={channel.lastChat?.content.message}
              lastMessageTime={channel.lastChat?.timestamp}
              profileSrc={channel.profile}
              unreadBadge={channel.unreadCount}
              silent={channel.silent}
              selected={channel.id === local.activeId}
              onClick={() => local.setActiveId?.(channel.id)}
            />
          )}
        </For>
      </ScrollArea>
    </div>
  );
};
