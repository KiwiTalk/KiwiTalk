import { For, JSX, splitProps } from 'solid-js';
import { useTransContext } from '@jellybrick/solid-i18next';

import { ScrollArea } from '@/ui-common/scroll-area';
import { ChannelItem } from '../channel-item';

import IconSearch from '@/assets/icons/search.svg';
import IconAddChat from '@/pages/main/channel/_assets/icons/add-chat.svg';

import * as styles from './channel-list.css';

import type { ChannelListItem } from '@/pages/main/channel/_types';

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

export type ChannelListProps = {
  activeId?: string;
  setActiveId?: (id: string) => void;

  channels: ChannelListItem[];
}
export const ChannelList = (props: ChannelListProps) => {
  const [itemProps] = splitProps(props, ['activeId', 'setActiveId']);
  const [t] = useTransContext();

  return (
    <div class={styles.container}>
      <header class={styles.header}>
        <span class={styles.title}>
          {t('main.menu.chat.name')}
        </span>
        <div class={styles.iconContainer}>
          <ChannelListIcon
            icon={<IconSearch />}
          />
          <ChannelListIcon
            icon={<IconAddChat />}
          />
        </div>
      </header>
      <ScrollArea component={'ul'} edgeSize={12}>
        <For each={props.channels}>
          {(channel) => (
            <ChannelItem
              name={channel.name}
              members={channel.userCount}
              lastMessage={channel.lastChat?.content}
              lastMessageTime={channel.lastChat?.timestamp}
              profileSrc={channel.profile}
              unreadBadge={channel.unreadCount}
              silent={channel.silent}
              selected={channel.id === itemProps.activeId}
              onClick={() => itemProps.setActiveId?.(channel.id)}
            />
          )}
        </For>
      </ScrollArea>
    </div>
  );
};
