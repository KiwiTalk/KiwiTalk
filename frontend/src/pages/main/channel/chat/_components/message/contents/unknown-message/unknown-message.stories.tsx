import { StoryFn } from 'storybook-solidjs';

import { UnknownMessage, UnknownMessageProps } from './unknown-message';

export default {
  title: 'KiwiTalk v2/Channel/Chat/Message/Unknown',
  component: UnknownMessage,
};

const Template: StoryFn = (props: UnknownMessageProps) => {
  return (
    <UnknownMessage type={props.type} />
  );
};

export const Default = Template.bind({});
Default.args = {
  type: 1,
};
