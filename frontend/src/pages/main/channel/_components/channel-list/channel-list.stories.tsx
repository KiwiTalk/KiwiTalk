import { StoryFn } from 'storybook-solidjs';

import * as styles from './channel-list.stories.css';
import { ChannelList, ChannelListProps, ChannelListViewModelType } from './channel-list';

import SearchIcon from '@/assets/icons/search.svg';
import AddChatIcon from '@/pages/main/channel/_assets/icons/add-chat.svg';

export default {
  title: 'KiwiTalk v2/Channel/Channel List',
  component: ChannelList,
};

const Template: StoryFn<ChannelListProps> = (props) => {
  const NoOpViewModel: ChannelListViewModelType = () => ({
    channels: () => [
      {
        id: '1',
        displayUsers: [
          {
            nickname: 'User 1',
            profileUrl: 'https://picsum.photos/200?s=1',
          },
          {
            nickname: 'User 2',
            profileUrl: 'https://picsum.photos/200?s=2',
          },
        ],

        lastChat: {
          chatType: 0,
          nickname: 'User 1',
          content: {
            message: 'last message',
            timestamp: new Date(),
          },
        },

        name: 'Channel 1',
        profile: 'https://picsum.photos/200?s=3',
        unreadCount: 6,
        userCount: 2,
        silent: false,
      },
      {
        id: '2',
        displayUsers: [
          {
            nickname: 'User 1',
          },
          {
            nickname: 'User 2',
            profileUrl: 'https://picsum.photos/200?s=5',
          },
        ],

        name: 'Channel 2',
        unreadCount: 0,
        userCount: 2,
        silent: true,
      },
    ],
    topItems: () => [
      {
        kind: 'click',
        icon: <SearchIcon />,
      },
      {
        kind: 'click',
        icon: <AddChatIcon />,
      },
    ],
  });

  return (
    <div class={styles.background}>
      <ChannelList
        viewModel={NoOpViewModel}
        selectedChannelId={props.selectedChannelId}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = { selectedChannelId: '1' };
