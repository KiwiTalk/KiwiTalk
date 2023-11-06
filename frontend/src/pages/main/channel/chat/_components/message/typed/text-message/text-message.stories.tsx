import { StoryFn } from 'storybook-solidjs';

import { TextMessage, TextMessageProps } from './text-message';

export default {
  title: 'KiwiTalk v2/Channel/Chat/Message/Text Message',
  component: TextMessage,
};

const Template: StoryFn = (props: TextMessageProps) => {
  return (
    <TextMessage
      isLong={props.isLong}
      content={props.content}
      longContent={props.longContent}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  isLong: false,
  content: 'Test Message',
};
