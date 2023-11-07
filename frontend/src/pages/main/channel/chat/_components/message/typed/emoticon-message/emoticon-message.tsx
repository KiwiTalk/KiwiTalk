import { mergeProps } from 'solid-js';
import { assignInlineVars } from '@vanilla-extract/dynamic';

import * as styles from './emoticon-message.css';

export type EmoticonMessageProps = {
  width?: number;
  height?: number;

  src: string;
  sound?: string;
};
export const EmoticonMessage = (props: EmoticonMessageProps) => {
  const merged = mergeProps({ width: 150, height: 150 }, props);

  const playSound = async () => {
    if (typeof props.sound !== 'string') return;

    const sound = new Audio(props.sound);
    await sound.play();
  };

  return (
    <img
      src={props.src}
      onLoad={playSound}
      onClick={playSound}
      class={styles.emoticon}
      style={assignInlineVars({
        [styles.width]: `${merged.width}px`,
        [styles.height]: `${merged.height}px`,
        [styles.ratio]: `${merged.height / merged.width * 100}%`,
      })}
    />
  );
};
