import { getOwner } from 'solid-js';
import { StoryFn } from 'storybook-solidjs';

import { MessageList, MessageListProps } from './message-list';
import { Chatlog } from '@/api/client';
import { ChatFactoryContext } from '../../_hooks/useChatFactory';
import { ChatFactory } from '../../_utils/chat-factory';
import { MockChannel } from '../../_utils/mock-channel';

export default {
  title: 'KiwiTalk v2/Channel/Chat/Message List',
  component: MessageList,
};

const Template: StoryFn<MessageListProps> = () => {
  const channel = new MockChannel();

  const messageGroups = channel.messages.reduce((acc, message) => {
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
          channelId={channel.id}
          logonId={'user-0'}
          messageGroups={messageGroups}
          members={Object.fromEntries(channel.members)}
        />
      </ChatFactoryContext.Provider>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {};
