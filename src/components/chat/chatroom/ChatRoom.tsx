import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import KakaoManager from '../../../KakaoManager';
import { ReducerType } from '../../../reducers';
import ChatList from '../ChatList';
import ChatNotice from '../ChatNotice';
import ChatInput from '../items/ChatInput';
import { extractRoomName } from '../utils/RoomInfoExtractor';
import Background from './resources/Background';
import Header from './resources/Header';

const ChatRoom: React.FC = () => {
  const [title, setTitle] = useState('');
  const { select } = useSelector((state: ReducerType) => state.chat);

  useEffect(() => {
    const channel = KakaoManager.getChannel(select);
    const name = extractRoomName(channel, channel.getUserInfoList());

    setTitle(name);
  }, [select]);

  return (
    <Background>
      <Header title={title}/>
      <ChatNotice />
      <ChatList />
      <div style={{ flex: 1 }}/>
      <ChatInput />
    </Background>
  );
};

export default ChatRoom;
