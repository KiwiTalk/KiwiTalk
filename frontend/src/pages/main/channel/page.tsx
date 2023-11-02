import { Outlet, useNavigate, useParams } from '@solidjs/router';

import { ChannelList } from './_components/channel-list';
import { useChannelList } from './_hooks';

import * as styles from './page.css';

export const ChannelListPage = () => {
  const navigate = useNavigate();
  const param = useParams();
  const channelList = useChannelList();

  const activeId = () => param.channelId;
  const setActiveId = (id: string) => {
    navigate(`${id}`);
  };

  return (
    <div class={styles.container}>
      <div class={styles.list}>
        <ChannelList
          channels={channelList()}
          activeId={activeId()}
          setActiveId={setActiveId}
        />
      </div>
      <Outlet />
    </div>
  );
};
