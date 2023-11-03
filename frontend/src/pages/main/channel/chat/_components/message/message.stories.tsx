import { StoryFn } from 'storybook-solidjs';

import { Message, type MessageProps } from './message';

export default {
  title: 'KiwiTalk v2/Channel/Chat/Message',
  component: Message,
};

const Template: StoryFn<MessageProps> = (props) => {
  return (
    <Message
      {...props}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  unread: 1,
  time: new Date(),
  isMine: true,
  isBubble: true,
  isConnected: false,

  children: 'Content',
};
