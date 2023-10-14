import { Accessor, createSignal, For, JSX, Match, mergeProps, Show, splitProps, Switch } from 'solid-js';

import IconChat from '@/assets/icons/chat.svg';
import IconNotification from '@/assets/icons/notification.svg';
import IconNotificationOff from '@/assets/icons/notification_off.svg';
import IconOpenChat from '@/assets/icons/openchat.svg';
import IconSettings from '@/assets/icons/settings.svg';
import IconUsers from '@/assets/icons/users.svg';

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
export type SidebarTabType<Path extends string> = {
  kind: 'tab';
  icon: JSX.Element,
  badge?: JSX.Element,
  path: Path,
};

export type SidebarToggleType = {
  kind: 'toggle';
  iconOn: JSX.Element;
  iconOff: JSX.Element;
  isActive: Accessor<boolean>;
  setIsActive: (isActive: boolean) => void;
};

type SidebarItemType<Path extends string> = SidebarTabType<Path> | SidebarToggleType;
type SidebarItemsProps<Path extends string> = {
  activePath: Path;
  setActivePath: (path: Path) => void;
  items: SidebarItemType<Path>[];
};

const SidebarItems = <Path extends string>(props: SidebarItemsProps<Path>) => (
  <div class={styles.sidebarItems}>
    <For each={props.items}>
      {(item) => (
        <Switch>
          {/* Tab */}
          <Match when={item.kind === 'tab' ? item : null}>
            {(tab) => (
              <SidebarButton
                badge={tab().badge}
                icon={tab().icon}
                isActive={tab().path === props.activePath}
                onClick={() => props.setActivePath(tab().path)}
              />
            )}
          </Match>

          {/* Toggle */}
          <Match when={item.kind === 'toggle' ? item : null}>
            {(toggle) => (
              <SidebarToggle
                iconOn={toggle().iconOn}
                iconOff={toggle().iconOff}
                isActive={toggle().isActive()}
                setIsActive={toggle().setIsActive}
              />
            )}
          </Match>
        </Switch>
      )}
    </For>
  </div>
);

export type SidebarViewModelType<Path extends string> = () => {
  topItems: Accessor<SidebarItemType<Path>[]>;
  bottomItems: Accessor<SidebarItemType<Path>[]>;
};

export const SidebarViewModel: SidebarViewModelType<SidebarPathType> = () => {
  // FIXME create @/features/config and migrate to useConfiguration
  const [isNotificationActive, setIsNotificationActive] = createSignal(false);

  return {
    topItems: () => [
      { kind: 'tab', icon: <IconUsers />, path: 'friends' },
      { kind: 'tab', icon: <IconChat />, path: 'chat', badge: 6 },
      { kind: 'tab', icon: <IconOpenChat />, path: 'openchat', badge: 12 },
    ],
    bottomItems: () => [
      {
        kind: 'toggle',
        iconOn: <IconNotification />,
        iconOff: <IconNotificationOff />,
        isActive: isNotificationActive,
        setIsActive: setIsNotificationActive,
      },
      { kind: 'tab', icon: <IconSettings />, path: 'settings' },
    ],
  };
};

type SidebarProps<Path extends string> =
  & { collapsed?: boolean }
  & Omit<SidebarItemsProps<Path>, 'items'>
  & (
    SidebarPathType extends Path
      ? { viewModel?: SidebarViewModelType<Path> }
      : { viewModel: SidebarViewModelType<Path> }
  );

export const Sidebar = <Path extends string = SidebarPathType>(props: SidebarProps<Path>) => {
  const [itemsProps] = splitProps(props, ['activePath', 'setActivePath']);
  const merged = mergeProps({ viewModel: SidebarViewModel as SidebarViewModelType<Path> }, props);
  const instance = merged.viewModel();

  return (
    <aside class={styles.sidebar[props.collapsed ? 'collapsed' : 'default']}>
      <SidebarItems items={instance.topItems()} {...itemsProps} />
      <Show when={!props.collapsed}>
        <SidebarItems items={instance.bottomItems()} {...itemsProps} />
      </Show>
    </aside>
  );
};
