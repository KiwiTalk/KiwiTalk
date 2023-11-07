import { assignInlineVars } from '@vanilla-extract/dynamic';
import * as styles from './emoticon-message.css';
import { mergeProps } from 'solid-js';

export type EmoticonMessageProps = {
  width?: string;
  height?: string;

  src: string;
  sound?: string;
};
export const EmoticonMessage = (props: EmoticonMessageProps) => {
  const merged = mergeProps({ width: '150px', height: '150px' }, props);

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
        [styles.width]: merged.width,
        [styles.height]: merged.height,
      })}
    />
  );
};
