import { StoryFn } from 'storybook-solidjs';

import * as styles from './friend-item.stories.css';
import { FriendItem, type FriendItemProps } from './friend-item';

export default {
  title: 'KiwiTalk v2/Friend/Friend Item',
  component: FriendItem,
};

const DefaultTemplate: StoryFn<FriendItemProps> = (props) => {
  return (
    <div class={styles.background}>
      <FriendItem
        {...props}
      />
    </div>
  );
};

const CollapsedTemplate: StoryFn<FriendItemProps> = (props) => {
  return (
    <div class={styles.background}>
      <FriendItem
        {...props}
        collapsed
      />
    </div>
  );
};

export const Default = DefaultTemplate.bind({});
Default.args = {
  name: '이름',
  profile: 'https://picsum.photos/200',
  description: '상태메시지 입니다',
};

export const Collapsed = CollapsedTemplate.bind({});
Collapsed.args = {
  name: '이름',
  profile: 'https://picsum.photos/200',
  description: '생일',
};
