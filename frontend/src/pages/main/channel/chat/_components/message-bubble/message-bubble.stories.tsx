import { StoryFn } from 'storybook-solidjs';

import { MessageBubble, MessageBubbleProps } from './message-bubble';

export default {
  title: 'KiwiTalk v2/Channel/Chat/MessageBubble',
  component: MessageBubble,
};

const Template: StoryFn<MessageBubbleProps> = (props) => {
  return (
    <MessageBubble
      {...props}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  last: false,
  owned: true,

  children: 'Content',
};
