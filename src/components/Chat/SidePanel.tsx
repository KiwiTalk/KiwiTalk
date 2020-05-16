import React from 'react';
import styled from 'styled-components';
import Search from './Search';
import ChatList from './ChatList';
import { ChatChannel, ClientChatUser } from '../../models/NodeKakaoPureObject';
import Profile from './Profile';
import { AccountSettings } from '../../models/NodeKakaoExtraObject';

const Wrapper = styled.div`
  width: 309px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

interface SidePanelProps {
  channelList: ChatChannel[]
  accountSettings?: AccountSettings
  onChange?: (index: number) => any;
}

const SidePanel: React.FC<SidePanelProps> = ({channelList, accountSettings, onChange}) => {
  return (
    <Wrapper>
      <Search />
      <ChatList channelList={channelList} onChange={onChange}/>
      <Profile accountSettings={accountSettings}/>
    </Wrapper>
  );
};

export default SidePanel;
