import { StoryFn } from 'storybook-solidjs';

import { ImageMessage, ImageMessageProps } from './image-message';

export default {
  title: 'KiwiTalk v2/Channel/Chat/Message/Image',
  component: ImageMessage,
};

const Template: StoryFn = (props: ImageMessageProps) => {
  return (
    <ImageMessage
      urls={props.urls}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  urls: [
    'https://picsum.photos/200',
  ],
};
