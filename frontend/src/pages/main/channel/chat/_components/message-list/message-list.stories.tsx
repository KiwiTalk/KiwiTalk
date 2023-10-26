import { StoryFn } from 'storybook-solidjs';

import * as styles from './message-list.stories.css';
import { MessageList, MessageListProps, MessageListViewModelType } from './message-list';
import { NormalChannelUser } from '@/api/client';

export default {
  title: 'KiwiTalk v2/Channel/Chat/Message List',
  component: MessageList,
};

const Template: StoryFn<MessageListProps> = () => {
  const NoOpViewModel: MessageListViewModelType = () => {
    const users = Array.from({ length: 5 })
      .map((_, index) => [`user-${index}`, {
        countryIso: 'ko-KR',
        statusMessage: 'Test Status Message',
        accountId: 'test-account-id',
        linkedServices: 'test-linked-services',
        suspended: false,
        id: `user-${index}`,

        nickname: `User ${index + 1}`,
        profileUrl: `https://picsum.photos/64?s=${Math.random()}`,
        fullProfileUrl: `https://picsum.photos/200?s=${Math.random()}`,
        originalProfileUrl: `https://picsum.photos/500?s=${Math.random()}`,

        watermark: 0n,
      }] as [string, NormalChannelUser])
      .reduce(
        (acc, [key, value]) => ({ ...acc, [key]: value }),
        {} as Record<string, NormalChannelUser>,
      );

    return {
      messages: () => Array.from({ length: 1000 }).map((_, i) => ({
        logId: `chat-${i}`,
        prevLogId: i > 0 ? `chat-${i - 1}` : undefined,

        senderId: `user-${Math.floor(Math.random() * 5)}`,
        sendAt: Date.now(),

        chatType: 0,

        content: 'Test Message'.repeat(Math.floor(Math.random() * 29) + 1),
        // attachment?: string,
        // supplement?: string,

        // referer: undefined,
      })),
      members: () => users,
      loadMore: () => {},
    };
  };
  return (
    <div class={styles.background}>
      <MessageList
        channelId={'channel-0'}
        logonId={'user-0'}
        viewModel={NoOpViewModel}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {};
