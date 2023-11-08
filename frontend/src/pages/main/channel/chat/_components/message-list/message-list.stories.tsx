import { getOwner } from 'solid-js';
import { StoryFn } from 'storybook-solidjs';

import { MessageList, MessageListProps } from './message-list';
import { Channel, Chatlog, NormalChannelUser } from '@/api/client';
import { ChatFactoryContext } from '../../_hooks/useChatFactory';
import { ChatFactory } from '../../_utils/chat-factory';

export default {
  title: 'KiwiTalk v2/Channel/Chat/Message List',
  component: MessageList,
};

const Template: StoryFn<MessageListProps> = () => {
  const messages: Chatlog[] = Array
    .from({ length: 1000 })
    .map((_, i) => ({
      logId: `${i}`,
      prevLogId: i > 0 ? `${i - 1}` : undefined,

      senderId: `user-${Math.floor(Math.random() * 5)}`,
      sendAt: Date.now(),

      chatType: 1,

      content: 'Test Message'.repeat(Math.floor(Math.random() * 29) + 1),
    }));

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

  const messageGroups = messages.reduce((acc, message) => {
    const lastMessage = acc.at(-1)?.at(-1);

    if (lastMessage?.senderId === message.senderId) {
      acc.at(-1)?.push(message);
    } else {
      acc.push([message]);
    }

    return acc;
  }, [] as Chatlog[][]);

  const chatFactory = new ChatFactory(channel, getOwner());

  return (
    <div style={`width: 100%; height: 600px;`}>
      <ChatFactoryContext.Provider value={() => chatFactory}>
        <MessageList
          channelId={'0'}
          logonId={'1'}
          messageGroups={messageGroups}
          members={Object.fromEntries(members)}
        />
      </ChatFactoryContext.Provider>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {};
