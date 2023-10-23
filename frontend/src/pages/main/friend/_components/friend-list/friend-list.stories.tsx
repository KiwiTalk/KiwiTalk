import { StoryFn } from 'storybook-solidjs';

import * as styles from './friend-list.stories.css';
import { FriendList, FriendListProps, FriendListViewModelType } from './friend-list';

import { FriendProfile } from '@/api';

import IconSearch from '@/assets/icons/search.svg';
import IconAddUser from '@/pages/main/friend/_assets/icons/add-user.svg';

export default {
  title: 'KiwiTalk v2/Friend/Friend List',
  component: FriendList,
};

const Template: StoryFn<FriendListProps> = () => {
  const allFriends: FriendProfile[] = Array.from({ length: 20 }).map((_, index) => ({
    userId: `user-${index}`,

    nickname: `User ${index + 1}`,

    userType: 0,
    userCategory: 0,

    statusMessage: Math.random() > 0.2 ? `status message ${index + 1}` : '',

    profileImageUrl: Math.random() > 0.2 ? `https://picsum.photos/200?s=${Math.random()}` : '',
  }));

  const NoOpViewModel: FriendListViewModelType = () => ({
    all: () => allFriends,
    pinned: () => allFriends.slice(0, 3),
    nearBirthday: () => allFriends.slice(3, 10),
    topItems: () => [
      {
        kind: 'click',
        icon: <IconSearch />,
      },
      {
        kind: 'click',
        icon: <IconAddUser />,
      },
    ],
  });

  return (
    <div class={styles.background}>
      <FriendList
        viewModel={NoOpViewModel}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {};
