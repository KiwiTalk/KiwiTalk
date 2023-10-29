import { StoryFn } from 'storybook-solidjs';

import { ChatEmpty } from './chat-empty';

export default {
  title: 'KiwiTalk v2/Channel/Chat/Chat Empty',
  component: ChatEmpty,
};

const Template: StoryFn = () => {
  return (
    <ChatEmpty />
  );
};

export const Default = Template.bind({});
Default.args = {};
