import { StoryFn } from 'storybook-solidjs';

import { EmoticonMessage, EmoticonMessageProps } from './emoticon-message';

export default {
  title: 'KiwiTalk v2/Channel/Chat/Message/Emoticon Message',
  component: EmoticonMessage,
};

const Template: StoryFn<EmoticonMessageProps> = (props) => {
  return (
    <EmoticonMessage
      {...props}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  width: 150,
  height: 150,
  src: 'https://picsum.photos/150/150',
  sound: 'https://cdn.freesound.org/previews/506/506546_6142149-lq.mp3',
};
