import { StoryFn } from 'storybook-solidjs';

import { ClientMessageBubble, MessageBubbleProps } from './message-bubble';

export default {
  title: 'KiwiTalk v2/Channel/Chat/ClientMessageBubble',
  component: ClientMessageBubble,
};

const Template: StoryFn<MessageBubbleProps> = (props) => {
  return (
    <ClientMessageBubble
      {...props}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  last: false,

  children: 'Content',
};
