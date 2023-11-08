import * as styles from './emoticon-message.css';

export type EmoticonMessageProps = {
  src: string;
  sound?: string;
  alt?: string;
};
export const EmoticonMessage = (props: EmoticonMessageProps) => {
  const playSound = async () => {
    if (typeof props.sound !== 'string') return;

    const sound = new Audio(props.sound);
    await sound.play();
  };

  const onRegisterSound = (element: Element) => {
    if (!props.sound) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.every((it) => it.intersectionRatio <= 0)) return;

      observer.disconnect();
      // playSound(); // TODO: enable this when sound setting is implemented
    });
    observer.observe(element);
  };

  return (
    <img
      ref={onRegisterSound}
      src={props.src}
      alt={props.alt}
      onClick={playSound}
      class={styles.emoticon}
    />
  );
};
