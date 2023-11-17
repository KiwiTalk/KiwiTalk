import { getOwner } from 'solid-js';
import { StoryFn } from 'storybook-solidjs';

import { MessageGroup, type MessageGroupProps } from './message-group';
import { ChatFactoryContext } from '../../_hooks/useChatFactory';
import { ChatFactory } from '../../_utils/chat-factory';
import { Channel, NormalChannelUser } from '@/api/client';

export default {
  title: 'KiwiTalk v2/Channel/Chat/Message Group',
  component: MessageGroup,
};

const members = Array.from({ length: 5 })
  .map((_, index) => [`user-${index}`, {
    countryIso: 'ko-KR',
    statusMessage: 'Test Status Message',
    accountId: 'test-account-id',
    linkedServices: 'test-linked-services',
    suspended: false,

    nickname: `User ${index + 1}`,
    profileUrl: `https://picsum.photos/64?s=${Math.random()}`,
    fullProfileUrl: `https://picsum.photos/200?s=${Math.random()}`,
    originalProfileUrl: `https://picsum.photos/500?s=${Math.random()}`,

    watermark: '0',
  }] as [string, NormalChannelUser]);

const channel: Channel = {
  kind: 'normal',
  content: {
    users: members,
  },
};

const Template: StoryFn<MessageGroupProps> = (props) => {
  const chatFactory = new ChatFactory(channel, getOwner());

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
