import { assignInlineVars } from '@vanilla-extract/dynamic';
import * as styles from './loader.css';
import { mergeProps } from 'solid-js';

export type LoaderProps = {
  duration?: string;
  size?: string;
}
export const Loader = (props: LoaderProps) => {
  const merged = mergeProps({
    duration: '0.6s',
    size: '1em',
  }, props);

  return (
    <div
      class={styles.container}
      style={assignInlineVars({
        [styles.duration]: merged.duration,
        [styles.size]: merged.size,
      })}
    >
      <div
        class={styles.dot}
        style={assignInlineVars({
          [styles.delayIndex]: '0',
        })}
      />
      <div
        class={styles.dot}
        style={assignInlineVars({
          [styles.delayIndex]: '1',
        })}
      />
      <div
        class={styles.dot}
        style={assignInlineVars({
          [styles.delayIndex]: '2',
        })}
      />
    </div>
  );
};
