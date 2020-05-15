import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ChatList from '../components/Chat/ChatList';
import { ChatChannel, ClientChatUser } from '../../public/src/NodeKakaoPureObject';
import { IpcRendererEvent } from 'electron';

import { getIpcRenderer } from '../functions/electron';
import Chatroom from '../components/Chat/Chatroom';
import SidePanel from '../components/Chat/SidePanel';

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
  const [clientUser, setClientUser] = useState<ClientChatUser>();

  ipcRenderer.on('channel_list', (event: IpcRendererEvent, channelList: ChatChannel[]) => {
    setChannelList(channelList);
  });

  ipcRenderer.on('client_user', (event: IpcRendererEvent, clientUser: ClientChatUser) => {
    console.log(clientUser)
    setClientUser(clientUser);
  })

  useEffect(() => {
    ipcRenderer.send('channel_list');
    ipcRenderer.send('client_user');
  }, [])

  return (
    <Wrapper>
      <SidePanel channelList={channelList} clientUser={clientUser}/>
      {channelList[selectedChannel] ? <Chatroom channel={channelList[selectedChannel]} /> : null}
    </Wrapper>
  );
};

export default Chat;
