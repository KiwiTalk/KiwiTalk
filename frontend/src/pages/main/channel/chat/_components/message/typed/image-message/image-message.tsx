import { For } from 'solid-js';

import * as styles from './image-message.css';

export type ImageMessageProps = {
  urls?: string[];
}
export const ImageMessage = (props: ImageMessageProps) => {
  return (
    <div data-grid-type={(props.urls?.length ?? 0) % 3} class={styles.container}>
      <For each={props.urls}>
        {(url) => (
          <img
            src={url}
            class={styles.image}
          />
        )}
      </For>
    </div>
  );
};
