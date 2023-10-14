import { createSignal } from 'solid-js';
import { StoryFn } from 'storybook-solidjs';

import IconChat from '@/assets/icons/chat.svg';
import IconNotification from '@/assets/icons/notification.svg';
import IconNotificationOff from '@/assets/icons/notification_off.svg';
import IconOpenChat from '@/assets/icons/openchat.svg';
import IconSettings from '@/assets/icons/settings.svg';
import IconUsers from '@/assets/icons/users.svg';

import { Sidebar, SidebarPathType, SidebarViewModelType } from './sidebar';
import * as styles from './sidebar.stories.css';

export default {
  title: 'KiwiTalk v2/Sidebar',
  component: Sidebar,
};

const Template: StoryFn<{ collapsed: boolean }> = (props) => {
  const [activePath, setActivePath] = createSignal<SidebarPathType>('friends');
  const NoOpViewModel: SidebarViewModelType<SidebarPathType> = () => {
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

  return (
    <div class={styles.background}>
      <Sidebar
        activePath={activePath()}
        setActivePath={setActivePath}
        collapsed={props.collapsed}
        viewModel={NoOpViewModel}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = { collapsed: false };

export const Collapsed = Template.bind({});
Collapsed.args = { collapsed: true };
