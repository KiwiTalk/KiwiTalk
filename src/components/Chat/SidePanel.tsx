import React from 'react';
import styled from 'styled-components';
import Search from './Search';
import ChatList from './ChatList';
import Profile from './Profile';
import {AccountSettings} from '../../models/NodeKakaoExtraObject';
import {ChatChannel} from "node-kakao/dist";

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
