import { StoryFn } from 'storybook-solidjs';

import { UserMessageBubble, MessageBubbleProps } from './message-bubble';

export default {
  title: 'KiwiTalk v2/Channel/Chat/UserMessageBubble',
  component: UserMessageBubble,
};

const Template: StoryFn<MessageBubbleProps> = (props) => {
  return (
    <UserMessageBubble
      {...props}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  last: false,

  children: 'Content',
};
