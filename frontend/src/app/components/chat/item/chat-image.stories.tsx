import { StoryFn } from 'storybook-solidjs';
import ChatImage from './image';
import { styled } from '../../../../utils';
import { imageContainer } from './chat-item.stories.css';

export default {
  title: 'KiwiTalk/chat/image',
  component: ChatImage,
  argTypes: {},
};

const Container = styled('div', imageContainer);

const Template: StoryFn<typeof ChatImage> = (args) => <Container>
  <ChatImage {...args} />
</Container>;

export const Default = Template.bind({});
Default.args = {
  thumbnail: 'https://picsum.photos/200',
  avatars: ['https://picsum.photos/200'],
  unread: 0,
};
