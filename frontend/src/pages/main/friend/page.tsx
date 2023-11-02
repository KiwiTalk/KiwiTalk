import { Outlet } from '@solidjs/router';

import { FriendList } from './_components/friend-list/friend-list';

import * as styles from './page.css';
import { useFriendList } from './_hooks';
import { createResource } from 'solid-js';
import { useReady } from '../_hooks';
import { meProfile } from '@/api';

export const FriendListPage = () => {
  const isReady = useReady();

  const friendList = useFriendList();
  const [me] = createResource(async () => {
    if (!isReady) return undefined;

    return meProfile();
  });


  return (
    <div class={styles.container}>
      <div class={styles.list}>
        <FriendList
          me={me()}
          pinned={friendList.pinned()}
          nearBirthday={friendList.nearBirthday()}
          all={friendList.all()}
        />
      </div>
      <Outlet />
    </div>
  );
};
