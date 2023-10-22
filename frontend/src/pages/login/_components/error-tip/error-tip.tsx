import { Show } from 'solid-js';

import * as styles from './error-tip.css';

export type ErrorTipProps = {
  message?: string | null | undefined;
}
export const ErrorTip = (props: ErrorTipProps) => {
  return (
    <Show when={typeof props.message === 'string'}>
      <div class={styles.error}>
        {/* TODO: replace to warning icon */}
        <div class={styles.errorIcon}>
          !
        </div>
        {props.message}
      </div>
    </Show>
  );
};
