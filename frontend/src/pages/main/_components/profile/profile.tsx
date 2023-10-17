import { Show, createEffect, createSignal, on } from 'solid-js';

import UserIcon from '@/assets/icons/user.svg';
import { emptyProfileContainer, emptyProfileIcon, profileBadge, profileContainer, profileImage } from './profile.css';

export const EmptyProfile = () => {
  return (
    <div class={emptyProfileContainer}>
      <UserIcon class={emptyProfileIcon} />
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
    <div class={profileContainer}>
      <Show
        when={!isEmpty()}
        fallback={<EmptyProfile />}
      >
        <img
          src={props.src}
          class={profileImage}
          onError={() => setIsEmpty(true)}
        />
      </Show>
      <span class={profileBadge[props.badge ? 'active' : 'inactive']}>
        {props.badge}
      </span>
    </div>
  );
};
