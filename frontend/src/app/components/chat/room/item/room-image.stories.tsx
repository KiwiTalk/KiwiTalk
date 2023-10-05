import { StoryFn } from 'storybook-solidjs';
import RoomImage from './image';
import { styled } from '../../../../../utils';
import { imageContainer } from './room-item.stories.css';

export default {
  title: 'KiwiTalk/chat/room/image',
  component: RoomImage,
  argTypes: {},
};

const Container = styled('div', imageContainer);

const Template: StoryFn<typeof RoomImage> = (args) => <Container>
  <RoomImage {...args} />
</Container>;

export const Default = Template.bind({});
Default.args = {
  thumbnail: 'https://picsum.photos/200',
  avatars: ['https://picsum.photos/200'],
};
