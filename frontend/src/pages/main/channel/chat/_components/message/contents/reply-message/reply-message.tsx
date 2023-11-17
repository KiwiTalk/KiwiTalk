import { Show } from 'solid-js';
import * as styles from './reply-message.css';
import { Loader } from '@/ui-common/loader';

export type ReplyMessageProps = {
  content?: string;
  replyContent?: string;
  replySender?: string;

  onReplyClick?: () => void;
};
export const ReplyMessage = (props: ReplyMessageProps) => {
  return (
    <div class={styles.container}>
      <div class={styles.replyContainer} onClick={props.onReplyClick}>
        <div class={styles.replyDivider} />
        <div class={styles.replyText.sender}>
          <Show when={props.replySender} fallback={<Loader />}>
            {props.replySender}
          </Show>
        </div>
        <div class={styles.replyText.content}>
          <Show when={props.replyContent} fallback={<Loader />}>
            {props.replyContent}
          </Show>
        </div>
      </div>
      {props.content}
    </div>
  );
};
