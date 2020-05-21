import React, {MouseEventHandler, useEffect, useState} from 'react';
import styled from 'styled-components';
import ChatListItem from './ChatListItem';
import ProfileDefault from '../../assets/images/profile_default.svg'
import color from '../../assets/colors/theme';
import {ChannelInfo, ChannelMetaStruct, ChannelMetaType, ChatChannel, UserInfo} from 'node-kakao/dist';

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

function extractRoomImage(channelInfo: ChannelInfo, userInfoList: UserInfo[]) {
    let imageUrl = channelInfo.RoomImageURL || ProfileDefault

    channelInfo.ChatMetaList.forEach((meta: ChannelMetaStruct) => {
        if (meta.Type === ChannelMetaType.PROFILE) {
            const content = JSON.parse(meta.Content)
            imageUrl = content.imageUrl
        }
    })

    if (imageUrl === ProfileDefault) {
        imageUrl = userInfoList[0] ? userInfoList[0].ProfileImageURL ? userInfoList[0].ProfileImageURL : ProfileDefault : ProfileDefault
    }

    return imageUrl
}

const AsyncComponent: React.FC<{ channel: ChatChannel, selected: boolean, onClick: MouseEventHandler }> = ({channel, selected, onClick}) => {
    const [comp, setComp] = useState<JSX.Element>();

    useEffect(() => {
        channel.getChannelInfo().then((ch: ChannelInfo) => {
            const userInfoList = ch.UserIdList.map((id) => ch.getUserInfoId(id)).filter((v, i) => i < 5 && v != null) as UserInfo[];
            const name = ch.Name ? ch.Name : userInfoList.map((userInfo) => userInfo?.User.Nickname).join(', ')
            setComp(<ChatListItem
                key={channel.Id.getLowBits()}
                lastChat={channel.LastChat ? channel.LastChat.Text : ''}
                profileImageSrc={extractRoomImage(ch, userInfoList)}
                username={name}
                selected={selected}
                onClick={onClick}/>)
        });
    }, [selected])

    return (
        <React.Fragment>
            {comp}
        </React.Fragment>
    );
};

const ChatList: React.FC<ChatListProps> = ({channelList, onChange}) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <Wrapper>
            {channelList.map((channel, index) =>
                <AsyncComponent channel={channel} selected={selectedIndex === index} onClick={() => {
                    setSelectedIndex(index);
                    onChange && onChange(index);
                }}/>)}
        </Wrapper>
    );
};

export default ChatList;
