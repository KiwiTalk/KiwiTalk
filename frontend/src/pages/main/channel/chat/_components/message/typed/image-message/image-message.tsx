import { For, JSX, createSignal } from 'solid-js';
import * as styles from './image-message.css';
import { assignInlineVars } from '@vanilla-extract/dynamic';

const imageSize = new Map<string, [number, number]>();

export type ImageMessageProps = {
  urls?: string[];
}
export const ImageMessage = (props: ImageMessageProps) => {
  const [loaded, setLoaded] = createSignal(false);

  const onImageLoad: JSX.EventHandlerUnion<HTMLImageElement, Event> = (event) => {
    setLoaded(true);
    imageSize.set(event.currentTarget.src, [event.currentTarget.width, event.currentTarget.height]);
  };

  return (
    <div data-grid-type={(props.urls?.length ?? 0) % 3} class={styles.container}>
      <For each={props.urls}>
        {(url) => (
          <img
            src={url}
            class={styles.image}
            width={imageSize.get(url)?.[0]}
            height={imageSize.get(url)?.[1]}
            style={!loaded() ? assignInlineVars({
              [styles.preservedWidth]: `${imageSize.get(url)?.[0]}px`,
              [styles.preservedHeight]: `${imageSize.get(url)?.[1]}px`,
            }) : undefined}
            onLoad={onImageLoad}
          />
        )}
      </For>
    </div>
  );
};
