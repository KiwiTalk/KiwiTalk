import React from 'react';
import styled from 'styled-components';
import Search from '../UiComponent/Search';
import ChatList from '../ChatroomList/ChatList';
import Profile from '../UiComponent/Profile';
import {ChatChannel, ClientSettingsStruct} from 'node-kakao/src';

const Wrapper = styled.div`
  width: 309px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

interface SidePanelProps {
    channelList: ChatChannel[]
    accountSettings?: ClientSettingsStruct
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
