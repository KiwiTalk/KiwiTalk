import React from 'react';
import styled from 'styled-components';
import Search from './Search';
import ChatList from './ChatList';
import { ChatChannel, ClientChatUser } from '../../../public/src/NodeKakaoPureObject';
import Profile from './Profile';
import { AccountSettings } from '../../../public/src/NodeKakaoExtraObject';

const Wrapper = styled.div`
  width: 309px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

interface SidePanelProps {
  channelList: ChatChannel[]
  accountSettings?: AccountSettings
}

const SidePanel: React.FC<SidePanelProps> = ({channelList, accountSettings}) => {
  return (
    <Wrapper>
      <Search />
      <ChatList channelList={channelList}/>
      <Profile accountSettings={accountSettings}/>
    </Wrapper>
  );
};

export default SidePanel;
