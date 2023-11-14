import { StoryFn } from 'storybook-solidjs';

import { ClientMessageGroup, ClientMessageGroupProps } from './message-group';
import { ClientMessageBubble } from '../message-bubble';

export default {
  title: 'KiwiTalk v2/Channel/Chat/ClientMessageGroup',
  component: ClientMessageGroup,
};

const Template: StoryFn<ClientMessageGroupProps> = (props) => {
  return <ClientMessageGroup {...props} />;
};

export const Default = Template.bind({});
Default.args = {
  profileImageUrl: 'https://picsum.photos/64?s=0',
  children: [
    <ClientMessageBubble last={true}>Content</ClientMessageBubble>,
  ],
};
