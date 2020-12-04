import React from 'react';
import styled from 'styled-components';
import Search from '../search';
import ChatRoomList from '../../chat/chat-room/list/chat-room-list';
import Profile from '../profile';
import {ChatChannel, MoreSettingsStruct} from 'node-kakao';

const Wrapper = styled.div`
  width: 309px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

interface SidePanelProps {
    channelList: ChatChannel[]
    accountSettings?: MoreSettingsStruct
    onChange?: (index: number) => any;
}

const SidePanel: React.FC<SidePanelProps> = ({
  channelList,
  accountSettings,
  onChange,
}) => {
  return (
    <Wrapper>
      <Search/>
      <ChatRoomList channelList={channelList} onChange={onChange}/>
      <Profile accountSettings={accountSettings}/>
    </Wrapper>
  );
};

export default SidePanel;
