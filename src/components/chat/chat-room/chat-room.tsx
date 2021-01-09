import { Chat, ChatChannel } from 'node-kakao';
import React, { ChangeEvent, EventHandler, FormEvent, useEffect, useState, } from 'react';
import Chats from '../chats';
import ChatInput from '../items/chat-input';
import { extractRoomName } from '../utils/room-info-extractor';
import Background from './resources/background';
import Header from './resources/header';

export interface ChatRoomProps {
  channel: ChatChannel
  chatList: Chat[]
  onInputChange: EventHandler<ChangeEvent<HTMLInputElement>>
  onSubmit: EventHandler<FormEvent>
  inputValue: string
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  channel,
  chatList,
  onInputChange,
  onSubmit,
  inputValue,
}) => {
  const [title, setTitle] = useState('');

  useEffect(() => {
    const userInfoList = channel.getUserInfoList();
    const name = extractRoomName(channel, userInfoList);

    setTitle(name);
  }, [channel]);

  return (
    <Background>
      <Header title={title}/>
      <Chats channel={channel} chatList={chatList}/>
      <ChatInput
        onChange={onInputChange}
        onSubmit={onSubmit}
        value={inputValue}/>
    </Background>
  );
};

export default ChatRoom;
