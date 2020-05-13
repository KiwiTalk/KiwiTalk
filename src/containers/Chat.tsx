import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ChatList from '../components/Chat/ChatList';
import { ChatChannel } from '../../public/src/NodeKakaoPureObject';
import { IpcRendererEvent } from 'electron';

const Wrapper = styled.div`
width: 100%;
height: 100vh;
`;

const {ipcRenderer} = window.require('electron');

const Chat = () => {
  const [channelList, setChannelList] = useState<ChatChannel[]>([]);
  ipcRenderer.on('channel_list', (event: IpcRendererEvent, channelList: ChatChannel[]) => {
    setChannelList(channelList);
  });
  useEffect(() => {
    ipcRenderer.send('channel_list');
  }, [])
  return (
    <Wrapper>
      <ChatList channelList={channelList}/>
    </Wrapper>
  );
};

export default Chat;
