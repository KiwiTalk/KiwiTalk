import { StoryFn } from 'storybook-solidjs';

import * as styles from './channel-header.stories.css';
import { ChannelHeader, type ChannelHeaderProps } from './channel-header';

export default {
  title: 'KiwiTalk v2/Channel/Channel Header',
  component: ChannelHeader,
};

const Template: StoryFn<ChannelHeaderProps> = (props) => {
  return (
    <div class={styles.background}>
      <ChannelHeader
        {...props}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  name: '제목',
  members: 6,
  profile: 'https://picsum.photos/200',
  silent: true,
};
