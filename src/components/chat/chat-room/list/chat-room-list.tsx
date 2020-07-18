import React, { MouseEventHandler, useEffect, useState } from 'react';
import styled from 'styled-components';
import color from '../../../../assets/colors/theme';
import { ChannelInfo, ChatChannel, UserInfo } from 'node-kakao/dist';
import ChatRoomListItem from './chat-room-list-item';
import { extractRoomName, extractRoomImage } from '../../utils/room-info-extractor';

const Wrapper = styled.div`
width: 309px;
flex: 1;
display: flex;
flex-direction: column;
background: ${color.GREY_900};
overflow-y: scroll;
::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}
`;

interface ChatListProps {
    channelList: ChatChannel[]
    onChange?: (index: number) => any;
}

const AsyncComponent: React.FC<{ channel: ChatChannel, selected: boolean, onClick: MouseEventHandler }> = ({ channel, selected, onClick }) => {
    const [comp, setComp] = useState<JSX.Element>();

    useEffect(() => {
        channel.getChannelInfo().then((ch: ChannelInfo) => {
            const userInfoList = ch.UserIdList.map((id) => ch.getUserInfoId(id)).filter((v, i) => i < 5 && v != null) as UserInfo[];

            const name = extractRoomName(ch, userInfoList);
            const profileImages = extractRoomImage(ch, userInfoList);

            setComp(<ChatRoomListItem
                key={channel.Id.toString()}
                lastChat={channel.LastChat ? channel.LastChat.Text : ''}
                profileImageSrcs={profileImages}
                username={name}
                selected={selected}
                onClick={onClick} />)
        });
    }, [selected])

    return (
        <React.Fragment>
            {comp}
        </React.Fragment>
    );
};

const ChatRoomList: React.FC<ChatListProps> = ({ channelList, onChange }) => {
    const [selectedIndex, setSelectedIndex] = useState(-1);

    return (
        <Wrapper>
            {channelList.map((channel, index) =>
                <AsyncComponent key={`channel-${channel.Id.toString()}`} channel={channel} selected={selectedIndex === index} onClick={() => {
                    setSelectedIndex(index);
                    onChange && onChange(index);
                }} />)}
        </Wrapper>
    );
};

export default ChatRoomList;
