import { StoryFn } from 'storybook-solidjs';

import * as styles from './channel-item.stories.css';
import { ChannelItem, type ChannelItemProps } from './channel-item';

export default {
  title: 'KiwiTalk v2/Channel/Channel Item',
  component: ChannelItem,
};

const Template: StoryFn<ChannelItemProps> = (props) => {
  return (
    <div class={styles.background}>
      <ChannelItem
        {...props}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  name: '제목',
  members: 6,

  lastMessage: '마지막으로 전송한 메시지입니다.',
  lastMessageTime: new Date(),
  profileSrc: 'https://picsum.photos/200',
  unreadBadge: 6,
  silent: true,
  selected: false,
};
