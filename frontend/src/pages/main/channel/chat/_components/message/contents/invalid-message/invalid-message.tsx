import * as styles from './invalid-message.css';

export type InvalidMessageProps = {
  name: string;
  key: string,
  expectedType: string,
  actualType: string,
};

export const InvalidMessage = (props: InvalidMessageProps) => {
  return (
    <div class={styles.container}>
      {props.name} 메세지를 읽는 중 오류가 발생했습니다.
      key: {props.key}, expectedType: {props.expectedType}, actualType: {props.actualType}
    </div>
  );
};
