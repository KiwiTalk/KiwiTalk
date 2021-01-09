import { Chat, ChatChannel } from 'node-kakao';
import React, { ChangeEvent, EventHandler, FormEvent, useEffect, useState, } from 'react';
import ChatList from '../ChatList';
import ChatInput from '../items/ChatInput';
import { extractRoomName } from '../utils/RoomInfoExtractor';
import Background from './resources/Background';
import Header from './resources/Header';

export interface ChatRoomProps {
  channel: ChatChannel;
  chatList: Chat[];
  selectedChannel: number;
  onInputChange: EventHandler<ChangeEvent<HTMLInputElement>>;
  onSubmit: EventHandler<FormEvent>;
  inputValue: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  channel,
  chatList,
  selectedChannel,
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
      <ChatList channel={channel} chatList={chatList} selectedChannel={selectedChannel}/>
      <ChatInput
        onChange={onInputChange}
        onSubmit={onSubmit}
        value={inputValue}/>
    </Background>
  );
};

export default ChatRoom;
