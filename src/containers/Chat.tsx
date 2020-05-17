import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import * as request from 'request-promise';
import Chatroom from '../components/Chat/Chatroom';
import SidePanel from '../components/Sidebar/SidePanel';
import SideBar from '../components/Sidebar/SideBar';
import {Chat as ChatObject, ChatChannel, TalkClient} from "node-kakao/dist";
import {AccountSettings} from "../models/NodeKakaoExtraObject";

const Wrapper = styled.div`
padding-top: 30px;
width: 100%;
height: 100vh;
box-sizing: border-box;
display: flex;
flex-direction: row;
`;

const remote = window.require('electron').remote;

const kakaoApi = remote.require('node-kakao').KakaoAPI;
const talkClient: TalkClient = remote.getGlobal('talkClient');

const Chat = () => {
    const [channelList, setChannelList] = useState<ChatChannel[]>([]);
    const [selectedChannel, setSelectedChannel] = useState(0);
    const [accountSettings, setAccountSettings] = useState<AccountSettings>();
    const [chatList, setChatList] = useState<ChatObject[]>([]);

    useEffect(() => {
        setChannelList(talkClient.ChannelManager.getChannelList());

        const accessToken: string = talkClient.ClientUser.MainUserInfo["clientAccessData"].AccessToken;
        const accountObject: request.RequestPromise = kakaoApi.requestAccountSettings(accessToken, remote.getGlobal('getUUID')());
        accountObject
            .then(result => {
                const accountSettings = JSON.parse(result) as AccountSettings;
                setAccountSettings(accountSettings);
            })
            .catch(error => {
                alert("오류가 발생했습니다.\n" + error);
            });

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
