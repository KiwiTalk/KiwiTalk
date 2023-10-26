import { Outlet, useNavigate, useParams } from '@solidjs/router';

import { ChannelList, ChannelListViewModel } from './_components/channel-list';

import * as styles from './page.css';

export const ChannelListPage = () => {
  const navigate = useNavigate();
  const param = useParams();

  const activeId = () => param.channelId;
  const setActiveId = (id: string) => {
    navigate(`${id}`);
  };

  return (
    <div class={styles.container}>
      <div class={styles.list}>
        <ChannelList
          viewModel={ChannelListViewModel}
          activeId={activeId()}
          setActiveId={setActiveId}
        />
      </div>
      <Outlet />
    </div>
  );
};
