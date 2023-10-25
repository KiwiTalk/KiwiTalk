import { Show, createEffect, createSignal, mergeProps, on } from 'solid-js';

import IconUser from '@/assets/icons/user.svg';
import * as styles from './profile.css';
import { assignInlineVars } from '@vanilla-extract/dynamic';

export const EmptyProfile = () => {
  return (
    <div class={styles.emptyProfileContainer}>
      <IconUser class={styles.emptyProfileIcon} />
    </div>
  );
};

type ProfileProps = {
  size?: string | number;
  src?: string;
  badge?: number;
};
export const Profile = (props: ProfileProps) => {
  const merged = mergeProps({ size: 48 }, props);

  const [isEmpty, setIsEmpty] = createSignal(!props.src);

  createEffect(on(() => props.src, () => {
    setIsEmpty(!props.src);
  }));

  return (
    <div
      class={styles.profileContainer}
      style={assignInlineVars({
        [styles.size]: typeof merged.size === 'number' ? `${merged.size}px` : merged.size,
      })}
    >
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
