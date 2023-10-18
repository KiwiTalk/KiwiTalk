import { useNavigate, useParams } from '@solidjs/router';
import { ChannelList, ChannelListViewModel } from './_components/channel-list/channel-list';

export const ChannelListPage = () => {
  const navigate = useNavigate();
  const param = useParams();
  
  const activeId = () => param.channelId;
  const setActiveId = (id: string) => {
    navigate(`${id}`);
  };

  return (
    <ChannelList
      viewModel={ChannelListViewModel}
      activeId={activeId()}
      setActiveId={setActiveId}
    />
  )
};
