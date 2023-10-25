import { StoryFn } from 'storybook-solidjs';

import * as styles from './channel-list.stories.css';
import { ChannelList, ChannelListProps, ChannelListViewModelType } from './channel-list';

import IconSearch from '@/assets/icons/search.svg';
import IconAddChat from '@/pages/main/channel/_assets/icons/add-chat.svg';
import { createSignal } from 'solid-js';
import { ListProfile } from '../../_types/channel-list-item';

export default {
  title: 'KiwiTalk v2/Channel/Channel List',
  component: ChannelList,
};

const Template: StoryFn<ChannelListProps> = () => {
  const getUsers = (length: number) => Array.from({ length })
    .map((_, index) => [`${index}`, {
      nickname: `User ${index + 1}`,
      profileUrl: `https://picsum.photos/200?s=${Math.random()}`,
    }] as [string, ListProfile]);

  const NoOpViewModel: ChannelListViewModelType = () => ({
    channels: () => Array.from({ length: 10 }).map((_, index) => {
      const userLength = 2 + Math.floor(Math.random() * 10);
      const displayUsers = getUsers(userLength);

      const lastChat = {
        chatType: 0,
        nickname: displayUsers[Math.floor(Math.random() * userLength)][1].nickname,
        content: 'last message',
        timestamp: new Date(),
      };

      return {
        id: `${index}`,
        displayUsers,

        lastChat: Math.random() > 0.2 ? lastChat : undefined,

        name: `Channel ${index + 1}`,
        unreadCount: Math.floor(Math.random() * 10),
        userCount: displayUsers.length,
        silent: Math.random() > 0.5,
      };
    }),
    topItems: () => [
      {
        kind: 'click',
        icon: <IconSearch />,
      },
      {
        kind: 'click',
        icon: <IconAddChat />,
      },
    ],
  });
  const [activeId, setActiveId] = createSignal('1');

  return (
    <div class={styles.background}>
      <ChannelList
        viewModel={NoOpViewModel}
        activeId={activeId()}
        setActiveId={setActiveId}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {};
