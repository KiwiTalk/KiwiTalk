import * as styles from './unknown-message.css';

export type UnknownMessageProps = {
  type?: number;
};
export const UnknownMessage = (props: UnknownMessageProps) => {
  return (
    <div class={styles.container}>
      "{props.type}" 타입의 메시지는 현재 지원하지 않습니다.
    </div>
  );
};
