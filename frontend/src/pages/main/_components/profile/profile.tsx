import { Show, createEffect, createSignal, on } from 'solid-js';

import UserIcon from '@/assets/icons/user.svg';
import * as styles from './profile.css';

export const EmptyProfile = () => {
  return (
    <div class={styles.emptyProfileContainer}>
      <UserIcon class={styles.emptyProfileIcon} />
    </div>
  );
};

type ProfileProps = {
  src?: string;
  badge?: number;
};
export const Profile = (props: ProfileProps) => {
  const [isEmpty, setIsEmpty] = createSignal(!props.src);

  createEffect(on(() => props.src, () => {
    setIsEmpty(!props.src);
  }));

  return (
    <div class={styles.profileContainer}>
      <Show
        when={!isEmpty()}
        fallback={<EmptyProfile />}
      >
        <img
          src={props.src}
          class={styles.profileImage}
          onError={() => setIsEmpty(true)}
        />
      </Show>
      <span class={styles.profileBadge[props.badge ? 'active' : 'inactive']}>
        {props.badge}
      </span>
    </div>
  );
};
