import React, { MouseEventHandler, useEffect, useState } from 'react';
import styled from 'styled-components';
import ProfileDefault from '../../../../assets/images/profile_default.svg'
import color from '../../../../assets/colors/theme';
import { ChannelInfo, ChannelMetaStruct, ChannelMetaType, ChatChannel, UserInfo } from 'node-kakao/dist';
import ChatRoomListItem from './ChatRoomListItem';
import { userInfo } from 'os';

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

function extractRoomImage (channelInfo: ChannelInfo, userInfoList: UserInfo[]) {
    let imageUrl = [channelInfo.RoomImageURL]

    if (!channelInfo.RoomImageURL) {
        channelInfo.ChatMetaList.forEach((meta: ChannelMetaStruct) => {
            if (meta.type === ChannelMetaType.PROFILE) {
                // @ts-ignore
                const content = JSON.parse(meta.content)
                imageUrl = [content.imageUrl]
            }
        })

        if (!imageUrl[0]) {
            imageUrl = userInfoList.slice(0, 4).map(e => e.ProfileImageURL || ProfileDefault)
        }
    }

    return imageUrl
}

function extractRoomName (channelInfo: ChannelInfo, userInfoList: UserInfo[]) {
    let result = channelInfo.Name;

    if (!result) {
        channelInfo.ChatMetaList.forEach((meta: ChannelMetaStruct) => {
            if (meta.type === ChannelMetaType.TITLE) {
                result = meta.content as string;
            }
        });

        if (!result) {
            result = userInfoList.map((userInfo) => userInfo?.User.Nickname).join(', ')
        }
    }

    return result;
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
                <AsyncComponent channel={channel} selected={selectedIndex === index} onClick={() => {
                    setSelectedIndex(index);
                    onChange && onChange(index);
                }} />)}
        </Wrapper>
    );
};

export default ChatRoomList;
