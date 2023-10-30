import { StoryFn } from 'storybook-solidjs';

import * as styles from './friend-list.stories.css';
import { FriendList, FriendListProps } from './friend-list';

import { FriendProfile, LogonProfile } from '@/api';

export default {
  title: 'KiwiTalk v2/Friend/Friend List',
  component: FriendList,
};

const Template: StoryFn<FriendListProps> = () => {
  const me: LogonProfile = {
    nickname: 'User 1',

    uuid: 'random-uuid',
    uuidSearchable: false,

    email: 'example1@kiwitalk.org',
    emailVerified: true,

    pstnNumber: '010-1234-5678',

    profile: {
      id: 'random-profile-id',

      statusMessage: 'status message',

      profileUrl: 'https://picsum.photos/200?s=1',
      backgroundUrl: 'https://picsum.photos/200?s=2',
    },
  };

  const allFriends: FriendProfile[] = Array.from({ length: 20 }).map((_, index) => ({
    userId: `user-${index}`,

    nickname: `User ${index + 1}`,

    userType: 0,
    userCategory: 0,

    statusMessage: Math.random() > 0.2 ? `status message ${index + 1}` : '',

    profileImageUrl: Math.random() > 0.2 ? `https://picsum.photos/200?s=${Math.random()}` : '',
  }));
  const pinned = allFriends.slice(0, 3);
  const nearBirthday = allFriends.slice(3, 10);

  return (
    <div class={styles.background}>
      <FriendList
        me={me}
        pinned={pinned}
        nearBirthday={nearBirthday}
        all={allFriends}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {};
