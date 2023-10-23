import { Profile } from '@/pages/main/_components/profile';
import * as styles from './friend-item.css';

export type FriendItemProps = {
  profile?: string;
  name: string;
  description?: string;

  collapsed?: boolean;
}
export const FriendItem = (props: FriendItemProps) => {
  const variant = () => props.collapsed ? 'collapsed' : 'default';

  return (
    <li class={styles.container[variant()]}>
      <Profile src={props.profile} size={44} />
      <div class={styles.textContainer[variant()]}>
        <span class={styles.title[variant()]}>{props.name}</span>
        <span class={styles.description[variant()]}>{props.description || '\u{3000}'}</span>
      </div>
    </li>
  );
};
