import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {v4} from 'uuid';
import Chatroom from '../components/Chat/Chatroom';
import SidePanel from '../components/Chat/SidePanel';
import SideBar from '../components/Chat/SideBar';
import {Chat as ChatObject, ChatChannel, TalkClient} from "node-kakao/dist";
import {AccountSettings} from "../models/NodeKakaoExtraObject";
import os from "os";

const Wrapper = styled.div`
padding-top: 30px;
width: 100%;
height: 100vh;
box-sizing: border-box;
display: flex;
flex-direction: row;
`;

const remote = window.require('electron').remote;

const store = new (remote.require('electron-store'))();

const createNewUUID = (): string => {
  return Buffer.from(v4()).toString('base64');
}

const getUUID = (): string => {
  let uuid = store.get('uuid') as string;
  if (uuid == null) {
    uuid = createNewUUID();
    store.set('uuid', uuid);
  }
  return uuid;
}

const getClientName = (): string => {
  let clientName = store.get('client_name') as string;
  if (clientName == null) {
    clientName = remote.require("os").hostname();
    store.set('client_name', clientName);
  }
  return clientName;
}

const nodeKakao = remote.require("node-kakao");
const talkClient: TalkClient = new nodeKakao.TalkClient(getClientName());

const Chat = () => {
  const [channelList, setChannelList] = useState<ChatChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState(0);
  const [accountSettings, setAccountSettings] = useState<AccountSettings>();
  const [chatList, setChatList] = useState<ChatObject[]>([]);

  useEffect(() => {
    setChannelList(talkClient.ChannelManager.getChannelList());

    const accessToken: string = talkClient.ClientUser.MainUserInfo["clientAccessData"].AccessToken;
    const accountSettings = JSON.parse(nodeKakao.KakaoAPI.requestAccountSettings(accessToken, getUUID())) as AccountSettings;
    setAccountSettings(accountSettings);

    talkClient.on('message', (chat: ChatObject) => {
      setChatList((prev) => [...prev, chat]);
    })
  }, [])
  console.log(chatList)
  console.log(selectedChannel)

  return (
    <Wrapper>
      <SideBar />
      <SidePanel channelList={channelList} accountSettings={accountSettings} onChange={(selectedChannel) => setSelectedChannel(selectedChannel)}/>
      {channelList[selectedChannel] ? <Chatroom channel={channelList[selectedChannel]} chatList={chatList} /> : null}
    </Wrapper>
  );
};

export default Chat;
