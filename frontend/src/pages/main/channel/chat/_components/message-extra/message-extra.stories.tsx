import { StoryFn } from 'storybook-solidjs';

import { MessageExtra, MessageExtraProps } from './message-extra';

export default {
  title: 'KiwiTalk v2/Channel/Chat/MessageExtra',
  component: MessageExtra,
};

const Template: StoryFn<MessageExtraProps> = (props) => {
  return (
    <MessageExtra
      {...props}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  direction: 'left',
  unread: 0,
  time: Date.now(),
};
