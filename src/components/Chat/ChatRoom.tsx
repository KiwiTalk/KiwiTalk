import React, {ChangeEvent, EventHandler, FormEvent} from 'react';
import styled from 'styled-components';
import ChatRoomColor from '../../assets/colors/chatroom';
import ChatRoomHeader from './ChatRoomHeader';
import {Chat, ChatChannel} from 'node-kakao/dist';
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
    return (
        <Wrapper>
            <ChatRoomHeader title={channel['channelInfo'].Name}/>
            <Chats channel={channel} chatList={chatList}/>
            <ChatInput onChange={onInputChange} onSubmit={onSubmit} value={inputValue}/>
        </Wrapper>
    )
};

export default ChatRoom;