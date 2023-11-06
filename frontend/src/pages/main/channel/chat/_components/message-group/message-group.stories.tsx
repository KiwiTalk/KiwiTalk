import { getOwner } from 'solid-js';
import { StoryFn } from 'storybook-solidjs';

import { MessageGroup, type MessageGroupProps } from './message-group';
import { ChatFactoryContext } from '../../_hooks/useChatFactory';
import { MockChannel } from '../../_utils/mock-channel';
import { ChatFactory } from '../../_utils/chat-factory';

export default {
  title: 'KiwiTalk v2/Channel/Chat/Message Group',
  component: MessageGroup,
};

const Template: StoryFn<MessageGroupProps> = (props) => {
  const chatFactory = new ChatFactory(new MockChannel({ delay: 1000 }), getOwner());

  return (
    <ChatFactoryContext.Provider value={() => chatFactory}>
      <MessageGroup
        {...props}
      />
    </ChatFactoryContext.Provider>
  );
};

export const Default = Template.bind({});
Default.args = {
  profile: 'https://picsum.photos/200',
  sender: 'User 1',

  messages: [
    {
      chatType: 1,
      content: 'Content 1',
      sendAt: Math.floor(Date.now() / 1000),
      senderId: '1',
      logId: '1',
    },
    {
      chatType: 1,
      content: 'Content 2',
      sendAt: Math.floor(Date.now() / 1000),
      senderId: '1',
      logId: '2',
    },
    {
      chatType: 26,
      content: 'Content 3',
      sendAt: Math.floor(Date.now() / 1000),
      senderId: '1',
      logId: '3',
    },
  ],

  members: [
    {
      nickname: 'User 1',

      profileUrl: 'https://picsum.photos/200',
      fullProfileUrl: 'https://picsum.photos/200',
      originalProfileUrl: 'https://picsum.photos/200',

      /** bigint */
      watermark: '1',
    },
    {
      nickname: 'User 2',

      profileUrl: 'https://picsum.photos/200',
      fullProfileUrl: 'https://picsum.photos/200',
      originalProfileUrl: 'https://picsum.photos/200',

      /** bigint */
      watermark: '1',
    },
    {
      nickname: 'User 3',

      profileUrl: 'https://picsum.photos/200',
      fullProfileUrl: 'https://picsum.photos/200',
      originalProfileUrl: 'https://picsum.photos/200',

      /** bigint */
      watermark: '2',
    },
  ],

  isMine: true,
};
