import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ChatChannel, Chat as ChatObject } from '../../public/src/NodeKakaoPureObject';
import { AccountSettings } from '../../public/src/NodeKakaoExtraObject';
import { IpcRendererEvent } from 'electron';

import { getIpcRenderer } from '../functions/electron';
import Chatroom from '../components/Chat/Chatroom';
import SidePanel from '../components/Chat/SidePanel';
import SideBar from '../components/Chat/SideBar';

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
  const [accountSettings, setAccountSettings] = useState<AccountSettings>();
  const [chatList, setChatList] = useState<ChatObject[]>([]);

  useEffect(() => {
    ipcRenderer.on('channel_list', (event: IpcRendererEvent, channelList: ChatChannel[]) => {
      setChannelList(channelList);
      ipcRenderer.send('account_settings');
    });
  
    ipcRenderer.on('account_settings', (event: IpcRendererEvent, accountSettings: AccountSettings) => {
      console.log(accountSettings)
      setAccountSettings(accountSettings);
    })

    ipcRenderer.on('chat', (event: IpcRendererEvent, chat: ChatObject) => {
      setChatList([...chatList, chat]);
    })

    ipcRenderer.send('channel_list');
  }, [])

  return (
    <Wrapper>
      <SideBar />
      <SidePanel channelList={channelList} accountSettings={accountSettings} onChange={(selectedChannel) => setSelectedChannel(selectedChannel)}/>
      {channelList[selectedChannel] ? <Chatroom channel={channelList[selectedChannel]} chatList={chatList} /> : null}
    </Wrapper>
  );
};

export default Chat;
