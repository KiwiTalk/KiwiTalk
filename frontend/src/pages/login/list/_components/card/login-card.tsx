import { Profile } from '@/pages/main/_components/profile';
import * as styles from './login-card.css';

export type LoginCardProps = {
  profile?: string;
  name?: string;
  email?: string;
};
export const LoginCard = (props: LoginCardProps) => {
  return (
    <li class={styles.container}>
      <Profile src={props.profile} />
      <div class={styles.textContainer}>
        <span class={styles.name}>
          {props.name}
        </span>
        <span class={styles.email}>
          {props.email}
        </span>
      </div>
    </li>
  );
};
