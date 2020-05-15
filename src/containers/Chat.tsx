import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ChatList from '../components/Chat/ChatList';
import { ChatChannel } from '../../public/src/NodeKakaoPureObject';
import { IpcRendererEvent } from 'electron';

import { getIpcRenderer } from '../functions/electron';
import Chatroom from '../components/Chat/Chatroom';

const Wrapper = styled.div`
padding-top: 30px;
width: 100%;
height: 100vh;
box-sizing: border-box;
display: flex;
flex-direction: row;
`;

const ipcRenderer = getIpcRenderer();

const Chat = () => {
  const [channelList, setChannelList] = useState<ChatChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState(0);

  ipcRenderer.on('channel_list', (event: IpcRendererEvent, channelList: ChatChannel[]) => {
    setChannelList(channelList);
  });

  useEffect(() => {
    ipcRenderer.send('channel_list');
  }, [])

  return (
    <Wrapper>
      <ChatList channelList={channelList}/>
      {channelList[selectedChannel] ? <Chatroom channel={channelList[selectedChannel]} /> : null}
    </Wrapper>
  );
};

export default Chat;
