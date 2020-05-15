import React from 'react';
import styled from 'styled-components';
import Search from './Search';
import ChatList from './ChatList';
import { ChatChannel, ClientChatUser } from '../../../public/src/NodeKakaoPureObject';
import Profile from './Profile';

const Wrapper = styled.div`
  width: 309px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

interface SidePanelProps {
  channelList: ChatChannel[]
  clientUser?: ClientChatUser
}

const SidePanel: React.FC<SidePanelProps> = ({channelList, clientUser}) => {
  return (
    <Wrapper>
      <Search />
      <ChatList channelList={channelList}/>
      <Profile clientUser={clientUser}/>
    </Wrapper>
  );
};

export default SidePanel;
