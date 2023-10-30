import { createSignal, onMount } from 'solid-js';
import { StoryFn } from 'storybook-solidjs';

import { Sidebar, SidebarPathType } from './sidebar';
import * as styles from './sidebar.stories.css';

export default {
  title: 'KiwiTalk v2/Sidebar',
  component: Sidebar,
};

const Template: StoryFn<{ collapsed: boolean }> = (props) => {
  const [activePath, setActivePath] = createSignal<SidebarPathType>('friends');
  const [notificationActive, setNotificationActive] = createSignal(false);
  const [badges, setBadges] = createSignal<[string, string]>(['...', '...']);

  onMount(() => {
    setTimeout(() => {
      setBadges(['1', '2']);
    }, 500);
  });

  return (
    <div class={styles.background}>
      <Sidebar
        collapsed={props.collapsed}
        activePath={activePath()}
        setActivePath={setActivePath}

        chatBadges={badges()[0]}
        openChatBadges={badges()[1]}
        notificationActive={notificationActive()}
        onNotificationActive={setNotificationActive}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = { collapsed: false };

export const Collapsed = Template.bind({});
Collapsed.args = { collapsed: true };
