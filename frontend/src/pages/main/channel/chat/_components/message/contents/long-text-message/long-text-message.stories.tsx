import { StoryFn } from 'storybook-solidjs';

import { LongTextMessage, LongTextMessageProps } from './long-text-message';

export default {
  title: 'KiwiTalk v2/Channel/Chat/Message/LongText',
  component: LongTextMessage,
};

const Template: StoryFn<LongTextMessageProps> = (props: LongTextMessageProps) => {
  return (
    <LongTextMessage {...props} />
  );
};

export const Default = Template.bind({});
Default.args = {
  content: 'Test Message',
};
