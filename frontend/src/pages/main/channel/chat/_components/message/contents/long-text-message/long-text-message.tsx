import { Button } from '@/ui-common/button';

import * as styles from './long-text-message.css';
import { Trans } from '@jellybrick/solid-i18next';

export type LongTextMessageProps = {
  content: string;
  onExpand?: () => void;
};

export const LongTextMessage = (props: LongTextMessageProps) => {
  return (
    <div class={styles.container}>
      <div class={styles.content}>
        {props.content}
      </div>
      <Button variant={'text'} class={styles.button} onClick={props.onExpand}>
        <Trans key={'main.chat.show_more'} />
      </Button>
    </div>
  );
};
