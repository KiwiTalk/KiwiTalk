import { StoryFn } from 'storybook-solidjs';

import { FriendItem } from '.';

export default {
  title: 'KiwiTalk/FriendItem',
  component: FriendItem,
};

const Template: StoryFn<typeof FriendItem> = (args) =>
  <FriendItem {...args} />;

export const Default = Template.bind({});
Default.args = {
  nickname: 'user1',
  statusMessage: 'Hello world!',
};
