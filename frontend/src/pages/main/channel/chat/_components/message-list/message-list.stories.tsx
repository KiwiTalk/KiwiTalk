import { StoryFn } from 'storybook-solidjs';

import * as styles from './message-list.stories.css';
import { MessageList, MessageListProps } from './message-list';
import { NormalChannelUser } from '@/api/client';

export default {
  title: 'KiwiTalk v2/Channel/Chat/Message List',
  component: MessageList,
};

const Template: StoryFn<MessageListProps> = () => {
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
    }] as [string, NormalChannelUser])
    .reduce(
      (acc, [key, value]) => ({ ...acc, [key]: value }),
      {} as Record<string, NormalChannelUser>,
    );

  const messages = Array.from({ length: 1000 }).map((_, i) => ({
    logId: `${i}`,
    prevLogId: i > 0 ? `${i - 1}` : undefined,

    senderId: `user-${Math.floor(Math.random() * 5)}`,
    sendAt: Date.now(),

    chatType: 1,

    content: 'Test Message'.repeat(Math.floor(Math.random() * 29) + 1),
    // attachment?: string,
    // supplement?: string,

    // referer: undefined,
  }));

  return (
    <div class={styles.background}>
      <MessageList
        channelId={'channel-0'}
        logonId={'user-0'}
        messages={messages}
        members={members}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {};
