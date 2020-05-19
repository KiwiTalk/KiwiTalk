import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react';
import styled from 'styled-components';
import * as request from 'request-promise';
import SidePanel from '../components/Sidebar/SidePanel';
import SideBar from '../components/Sidebar/SideBar';
import {Chat as ChatObject, ChatChannel, TalkClient} from "node-kakao/dist";
import {AccountSettings} from "../models/NodeKakaoExtraObject";
import Chatroom from '../components/Chat/Chatroom';

const Wrapper = styled.div`
padding-top: 20px;
width: 100%;
height: 100vh;
box-sizing: border-box;
display: flex;
flex-direction: row;
`;

const nodeKakao = require('node-kakao');
// @ts-ignore
const talkClient: TalkClient = global.talkClient;

const Chat = () => {
    const [channelList, setChannelList] = useState<ChatChannel[]>([]);
    const [selectedChannel, setSelectedChannel] = useState(0);
    const [accountSettings, setAccountSettings] = useState<AccountSettings>();
    const [chatList, setChatList] = useState<ChatObject[]>([]);
    const [inputText, setInputText] = useState('');

    const messageHook = (chat: ChatObject) => {
        setChatList((prev) => [...prev, chat]);
  }

  useEffect(() => {
      setChannelList(talkClient.ChannelManager.getChannelList());

      const accessToken: string = talkClient.ClientUser.MainUserInfo["clientAccessData"].AccessToken;
      // @ts-ignore
      global.getUUID()
          .then((uuid: string) => {
              const accountObject: request.RequestPromise = nodeKakao.KakaoAPI.requestAccountSettings(accessToken, uuid);
              accountObject
                  .then((result: any) => {
                      const accountSettings = JSON.parse(result) as AccountSettings;
                      setAccountSettings(accountSettings);
                  })
                  .catch((error: any) => {
                      alert("오류가 발생했습니다.\n" + error);
                  });

              talkClient.on('message', messageHook);
          });
  }, [])
  // console.log(chatList)
  // console.log(selectedChannel)

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const channel = channelList[selectedChannel];
    if (!channel?.Id) return;
    if (inputText.length <= 0) return;

    channel.sendText(inputText)
      .then(result => {
        setInputText('');

        messageHook(result);
      })
      .catch(error => {
        alert('메시지 발송 중 오류 발생');
      });
  }

  return (
    <Wrapper>
      <SideBar />
      <SidePanel
        channelList={channelList}
        accountSettings={accountSettings}
        onChange={(selectedChannel) => setSelectedChannel(selectedChannel)} />
      {
      channelList[selectedChannel]
        ? <Chatroom
            channel={channelList[selectedChannel]}
            chatList={chatList.filter((chat) => chat.Channel.Id.low === channelList[selectedChannel].Id.low)}
            onInputChange={onChange}
            onSubmit={onSubmit} inputValue={inputText} />
        : null
      }
    </Wrapper>
  );
};

export default Chat;
