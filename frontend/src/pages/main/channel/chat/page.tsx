import { Show } from 'solid-js';
import { useParams } from '@solidjs/router';

import { MessageList, MessageListViewModel } from './_components/message-list';

import * as styles from './page.css';

export const ChatPage = () => {
  const params = useParams();
  const channelId = () => params.channelId;

  return (
    <div class={styles.container}>
      <Show when={channelId()}>
        <MessageList
          channelId={channelId()!}
          viewModel={MessageListViewModel}
        />
      </Show>
    </div>
  );
};
