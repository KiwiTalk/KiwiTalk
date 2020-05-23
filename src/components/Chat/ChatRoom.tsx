import React, {ChangeEvent, EventHandler, FormEvent, useEffect, useState} from 'react';
import styled from 'styled-components';
import ChatRoomColor from '../../assets/colors/chatroom';
import ChatRoomHeader from './ChatRoomHeader';
import {Chat, ChatChannel, ChannelInfo, UserInfo} from 'node-kakao/dist';
import Chats from './Chats';
import ChatInput from './ChatInput';

const Wrapper = styled.div`
position: relative;
display: flex;
flex-direction: column;
background: ${ChatRoomColor.BACKGROUND};
flex: 1;
min-width: 0;
`;

export interface ChatroomProps {
    channel: ChatChannel
    chatList: Chat[]
    onInputChange: EventHandler<ChangeEvent<HTMLInputElement>>
    onSubmit: EventHandler<FormEvent>
    inputValue: string
}

const ChatRoom: React.FC<ChatroomProps> = ({channel, chatList, onInputChange, onSubmit, inputValue}) => {
    const [title, setTitle] = useState('')
    useEffect(() => {
        channel.getChannelInfo().then((ch: ChannelInfo) => {
            const userInfoList = ch.UserIdList.map((id) => ch.getUserInfoId(id)).filter((v, i) => i < 5 && v != null) as UserInfo[];
            const name = ch.Name ? ch.Name : userInfoList.map((userInfo) => userInfo?.User.Nickname).join(', ')
            setTitle(name)
        });
    }, [channel])
    return (
        <Wrapper>
            <ChatRoomHeader title={title}/>
            <Chats channel={channel} chatList={chatList}/>
            <ChatInput onChange={onInputChange} onSubmit={onSubmit} value={inputValue}/>
        </Wrapper>
    )
};

export default ChatRoom;