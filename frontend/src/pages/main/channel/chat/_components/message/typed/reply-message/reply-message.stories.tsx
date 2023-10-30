import { StoryFn } from 'storybook-solidjs';

import { ReplyMessage, ReplyMessageProps } from './reply-message';

export default {
  title: 'KiwiTalk v2/Channel/Chat/Message/Reply Message',
  component: ReplyMessage,
};

const Template: StoryFn = (props: ReplyMessageProps) => {
  return (
    <ReplyMessage
      content={props.content}
      replyContent={props.replyContent}
      replySender={props.replySender}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  content: 'Test Message',
  replyContent: 'Test Reply Message',
  replySender: 'Test User',
};
