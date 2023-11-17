import { StoryFn } from 'storybook-solidjs';

import { InvalidMessage, InvalidMessageProps } from './invalid-message';

export default {
  title: 'KiwiTalk v2/Channel/Chat/Message/Invalid',
  component: InvalidMessage,
};

const Template: StoryFn<InvalidMessageProps> = (props: InvalidMessageProps) => {
  return (
    <InvalidMessage {...props} />
  );
};

export const Default = Template.bind({});
Default.args = {
  name: 'Text',
  key: 'a',
};
