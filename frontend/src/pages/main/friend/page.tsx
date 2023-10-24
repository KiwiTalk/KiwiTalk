import { Outlet } from '@solidjs/router';

import { FriendList, FriendListViewModel } from './_components/friend-list/friend-list';

import * as styles from './page.css';

export const FriendListPage = () => {
  return (
    <div class={styles.container}>
      <div class={styles.list}>
        <FriendList viewModel={FriendListViewModel} />
      </div>
      <Outlet />
    </div>
  );
};
