import * as styles from './image-message.css';

export type ImageMessageProps = {
  url?: string;
}
export const ImageMessage = (props: ImageMessageProps) => {
  return (
    <img
      src={props.url}
      class={styles.image}
    />
  );
};
