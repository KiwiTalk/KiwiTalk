import * as styles from './reply-message.css';

export type ReplyMessageProps = {
  content?: string;
  replyContent?: string;
  replySender?: string;

  onClickReply?: () => void;
};
export const ReplyMessage = (props: ReplyMessageProps) => {
  return (
    <div class={styles.container}>
      <div class={styles.replyContainer} onClick={props.onClickReply}>
        <div class={styles.replyDivider} />
        <div class={styles.replyText.sender}>
          {props.replySender}
        </div>
        <div class={styles.replyText.content}>
          {props.replyContent}
        </div>
      </div>
      {props.content}
    </div>
  );
};
