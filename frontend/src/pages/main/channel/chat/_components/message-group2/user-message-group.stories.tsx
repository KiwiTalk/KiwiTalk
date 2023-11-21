import { StoryFn } from 'storybook-solidjs';

import { UserMessageGroup, UserMessageGroupProps } from './message-group';
import { UserMessageBubble } from '../message-bubble';

export default {
  title: 'KiwiTalk v2/Channel/Chat/UserMessageGroup',
  component: UserMessageGroup,
};

const Template: StoryFn<UserMessageGroupProps> = (props) => {
  return <UserMessageGroup {...props} />;
};

export const Default = Template.bind({});
Default.args = {
  profileImageUrl: 'https://picsum.photos/64?s=0',
  nickname: 'sample',
  children: [
    <UserMessageBubble last={true}>Content</UserMessageBubble>,
  ],
};
