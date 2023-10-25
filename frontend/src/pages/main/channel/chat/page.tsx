import { Show } from 'solid-js';
import { useParams } from '@solidjs/router';

import { MessageList, MessageListViewModel } from './_components/message-list';

import * as styles from './page.css';
import { ChannelHeader } from '../_components/channel-header';

export const ChatPage = () => {
  const params = useParams();
  const channelId = () => params.channelId;

  return (
    <div class={styles.container}>
      <ChannelHeader />
      <Show when={channelId()}>
        <MessageList
          channelId={channelId()!}
          viewModel={MessageListViewModel}
        />
      </Show>
    </div>
  );
};
