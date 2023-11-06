import { Show } from 'solid-js';

import { Button } from '@/ui-common/button';

import * as styles from './text-message.css';
import { Trans } from '@jellybrick/solid-i18next';

export type TextMessageProps = {
  isLong?: boolean;
  content?: string;
  longContent?: string;

  onShowMore?: () => void;
};
export const TextMessage = (props: TextMessageProps) => {
  return (
    <Show when={props.isLong} fallback={props.content}>
      <div class={styles.container}>
        <div class={styles.content}>
          {props.content}
        </div>
        <Button variant={'text'} class={styles.button} onClick={props.onShowMore}>
          <Trans key={'main.chat.show_more'} />
        </Button>
      </div>
    </Show>
  );
};
