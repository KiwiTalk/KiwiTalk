import * as styles from './invalid-message.css';

export type InvalidMessageProps = {
  name: string,
  message: string,
};

export const InvalidMessage = (props: InvalidMessageProps) => {
  return (
    <div class={styles.container}>
      {props.name} 메세지를 읽는 중 오류가 발생했습니다.
      {props.message}
    </div>
  );
};
