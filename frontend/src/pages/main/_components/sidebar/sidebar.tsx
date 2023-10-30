import {
  For,
  JSX,
  Match,
  Show,
  Switch,
  mergeProps,
  splitProps,
} from 'solid-js';

import IconChat from '@/assets/icons/chat.svg';
import IconUsers from '@/assets/icons/users.svg';
import IconOpenChat from '@/assets/icons/openchat.svg';
import IconSettings from '@/assets/icons/settings.svg';
import IconNotification from '@/assets/icons/notification.svg';
import IconNotificationOff from '@/assets/icons/notification_off.svg';

import * as styles from './sidebar.css';

type SidebarButtonProps = {
  isActive: boolean;
  icon: JSX.Element;
  badge?: JSX.Element;
  onClick: () => void;
};
const SidebarButton = (props: SidebarButtonProps) => (
  <button
    type="button"
    class={styles.sidebarItem[props.isActive ? 'active' : 'inactive']}
    onClick={props.onClick}
  >
    {props.icon}
    <span class={styles.sidebarButtonBadge[props.badge ? 'active' : 'inactive']}>
      {props.badge}
    </span>
  </button>
);

type SidebarToggleProps = {
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
  iconOn: JSX.Element;
  iconOff: JSX.Element;
};
const SidebarToggle = (props: SidebarToggleProps) => (
  <label class={styles.sidebarToggle[props.isActive ? 'active' : 'inactive']}>
    <input
      class={styles.sidebarToggleInput}
      type="checkbox"
      checked={props.isActive}
      onChange={({ target }) => props.setIsActive(target.checked)}
    />

    <span class={styles.sidebarToggleIconContainer}>
      <span class={styles.sidebarToggleIcon[props.isActive ? 'active' : 'inactive']}>
        {props.iconOn}
      </span>
      <span class={styles.sidebarToggleIcon[!props.isActive ? 'active' : 'inactive']}>
        {props.iconOff}
      </span>
    </span>
  </label>
);

export type SidebarPathType = 'friends' | 'chat' | 'openchat' | 'settings';
export type SidebarTabType = {
  kind: 'tab';
  icon: JSX.Element;
  badge?: string | number;
  path: SidebarPathType;
};

export type SidebarToggleType = {
  kind: 'toggle';
  iconOn: JSX.Element;
  iconOff: JSX.Element;
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
};

type SidebarItemType = SidebarTabType | SidebarToggleType;
type SidebarItemsProps = {
  activePath: string;
  setActivePath: (path: string) => void;
  items: SidebarItemType[];
};

const SidebarItems = (props: SidebarItemsProps) => (
  <div class={styles.sidebarItems}>
    <For each={props.items}>
      {(item) => (
        <Switch>
          {/* Tab */}
          <Match keyed when={item.kind === 'tab' ? item : null}>
            {(tab) => (
              <SidebarButton
                badge={tab.badge}
                icon={tab.icon}
                isActive={tab.path === props.activePath}
                onClick={() => props.setActivePath(tab.path)}
              />
            )}
          </Match>

          {/* Toggle */}
          <Match keyed when={item.kind === 'toggle' ? item : null}>
            {(toggle) => (
              <SidebarToggle
                iconOn={toggle.iconOn}
                iconOff={toggle.iconOff}
                isActive={toggle.isActive}
                setIsActive={toggle.setIsActive}
              />
            )}
          </Match>
        </Switch>
      )}
    </For>
  </div>
);

type SidebarProps = {
  collapsed?: boolean;
  activePath: string;
  setActivePath: (path: string) => void;

  chatBadges?: string | number;
  openChatBadges?: string | number;
  notificationActive?: boolean;
  onNotificationActive?: (notificationActive: boolean) => void;
}

export const Sidebar = (props: SidebarProps) => {
  const [itemsProps, local] = splitProps(
    mergeProps({ notificationActive: false, onNotificationActive: () => {} }, props),
    ['activePath', 'setActivePath'],
  );

  const topItems = (): SidebarItemType[] => [
    {
      kind: 'tab',
      icon: <IconUsers />,
      path: 'friends',
    },
    {
      kind: 'tab',
      icon: <IconChat />,
      path: 'chat',
      badge: props.chatBadges ?? '...',
    },
    {
      kind: 'tab',
      icon: <IconOpenChat />,
      path: 'openchat',
      badge: props.openChatBadges ?? '...',
    },
  ];

  const bottomItems = (): SidebarItemType[] => [
    {
      kind: 'toggle',
      iconOn: <IconNotification />,
      iconOff: <IconNotificationOff />,
      isActive: local.notificationActive,
      setIsActive: local.onNotificationActive,
    },
    {
      kind: 'tab',
      icon: <IconSettings />,
      path: 'settings',
    },
  ];

  return (
    <aside class={styles.sidebar[props.collapsed ? 'collapsed' : 'default']}>
      <SidebarItems items={topItems()} {...itemsProps} />
      <Show when={!props.collapsed}>
        <SidebarItems items={bottomItems()} {...itemsProps} />
      </Show>
    </aside>
  );
};
