import React from 'react';
import styled from 'styled-components';
import Search from '../Etc/Search';
import ChatRoomList from '../Chat/ChatRoom/List/ChatRoomList';
import Profile from '../Etc/Profile';
import {ChatChannel, MoreSettingsStruct} from 'node-kakao/dist';

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

const SidePanel: React.FC<SidePanelProps> = ({channelList, accountSettings, onChange}) => {
    return (
        <Wrapper>
            <Search/>
            <ChatRoomList channelList={channelList} onChange={onChange}/>
            <Profile accountSettings={accountSettings}/>
        </Wrapper>
    );
};

export default SidePanel;
