import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ChatList from '../components/Chat/ChatList';
import { ChatChannel } from '../../public/src/NodeKakaoPureObject';
import { IpcRendererEvent } from 'electron';

import {getIpcRenderer} from '../functions/electron';

const Wrapper = styled.div`
padding-top: 30px;
width: 100%;
height: 100vh;
box-sizing: border-box;
`;

const ipcRenderer = getIpcRenderer();

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
