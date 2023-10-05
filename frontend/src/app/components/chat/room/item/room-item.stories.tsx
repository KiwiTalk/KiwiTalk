import { StoryFn } from 'storybook-solidjs';
import RoomItem from './';
import { styled } from '../../../../../utils';
import { container } from './room-item.stories.css';

export default {
  title: 'KiwiTalk/chat/room/item',
  component: RoomItem,
  argTypes: {},
};

const Container = styled('div', container);

const Template: StoryFn<typeof RoomItem> = (args) => <Container>
  <RoomItem {...args} />
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
