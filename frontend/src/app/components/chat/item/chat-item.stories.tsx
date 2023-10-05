import { StoryFn } from 'storybook-solidjs';
import ChatItem from '.';
import { styled } from '../../../../utils';
import { container } from './chat-item.stories.css';

export default {
  title: 'KiwiTalk/chat/item',
  component: ChatItem,
  argTypes: {},
};

const Container = styled('div', container);

const Template: StoryFn<typeof ChatItem> = (args) => <Container>
  <ChatItem {...args} />
</Container>;

export const Default = Template.bind({});
Default.args = {
  name: 'Example',
  memberCount: 1,
  lastMessage: 'Hello World',
  lastUpdateTime: new Date(),
  thumbnail: 'https://picsum.photos/200',
  avatars: ['https://picsum.photos/200'],

  isDM: false,
  isPinned: false,
  isForum: false,
  isMuted: false,

  unread: 0,
};
