import { StoryFn } from 'storybook-solidjs';

import * as styles from './message.stories.css';
import { Message, type MessageProps } from './message';

export default {
  title: 'KiwiTalk v2/Channel/Chat/Message',
  component: Message,
};

const Template: StoryFn<MessageProps> = (props) => {
  return (
    <div class={styles.background}>
      <Message
        {...props}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  profile: 'https://picsum.photos/200',
  sender: 'User 1',

  unread: 1,
  time: new Date(),
  isMine: true,
  isBubble: true,

  children: 'Content',
};
