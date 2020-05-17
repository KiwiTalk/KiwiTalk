import React, { useState, ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import styled from 'styled-components';
import ChatroomHeader from './ChatroomHeader';
import { ChatChannel, Chat, ChatType } from '../../models/NodeKakaoPureObject';
import IconButton from './IconButton';
import color from '../../assets/javascripts/color';
import IconAttachment from '../../assets/images/icon_attachment.svg';
import IconEmoji from '../../assets/images/icon_emoji.svg';
import IconSend from '../../assets/images/icon_send.svg';
import Bubble from './Bubble';
import ChatItem from './ChatItem';
import { ChatUser } from 'node-kakao';
import { IpcRendererEvent } from 'electron';

import { getIpcRenderer } from '../../functions/electron';

const ipcRenderer = getIpcRenderer();

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  background: ${color.BACKGROUND};
  flex: 1;
  min-width: 0;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding: 46px 27px 90px 42px;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    width: 3px;
    background: ${color.GREY_400};
  }
`;

const FloatingBar = styled.div`
  background: ${color.GREY_900};
  position: absolute;
  display: flex;
  bottom: 0px;
  left: 0px;

  width: 100%;
  height: 89px;

`

const FloatingInputContainer = styled.div`
  display: flex;
  flex: 1;
  background: ${color.GREY_800};
  border-radius: 9999px;
  
  margin: 20px;
`

const FloatingInput = styled.input`
  background: none;
  border: none;
  width: 100%;
  padding: 20px 64px 20px 20px;
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  outline: none;
`;

interface ChatroomProps {
  channel: ChatChannel
  chatList: Chat[]
}

const Contents: React.FC<ChatroomProps> = ({ channel, chatList }) => {
  let bubbles: JSX.Element[] = [];
  let nextWithAuthor = true

  return (
    <Content>{
      chatList.filter((chat) => chat.type === ChatType.Text && chat.channel.id.low === channel.id.low).map((chat, index, arr) => {
        const isMine = chat.sender == undefined;
        let willSenderChange = arr.length - 1 === index;

        if (isMine) willSenderChange = willSenderChange || arr[index + 1].sender !== undefined;
        else willSenderChange = willSenderChange || arr[index + 1].sender?.id.low !== chat.sender.id.low;

        const sendDate = new Date(chat.sendTime)

        bubbles.push(<Bubble key={chat.messageId}
          hasTail={willSenderChange}
          unread={1}
          author={nextWithAuthor ? chat.sender?.nickname : ''}
          isMine={isMine}
          time={`${sendDate.getHours()}:${sendDate.getMinutes()}`}>{chat.text}</Bubble>);
        
        nextWithAuthor = false;

        if (willSenderChange) {
          const chatItem = <ChatItem profileImageSrc={channel.channelInfo.userInfoMap[chat.sender?.id.low]?.profileImageURL}
            key={chat.messageId}>{bubbles}</ChatItem>
          bubbles = []
          nextWithAuthor = true;
          return chatItem;
        }
      })
    }
    </Content>
  );
};

const Chatroom: React.FC<ChatroomProps> = ({ channel, chatList }) => {
  let [text, setText] = useState('')

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    text = event.target.value;
    setText(text);
  }

  const onKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    console.log(event.key)
    switch (event.key) {
      case 'Enter':
        sendMessage();
        break;
    }
  }

  const sendMessage = () => {
    if (!channel.id) return;
    if (text.length <= 0) return;

    const ipcRenderer = getIpcRenderer();

    ipcRenderer.send('message', channel.id, text);

    text = '';
    setText(text);
  }

  return (
    <Wrapper>
      <ChatroomHeader title={channel.channelInfo.name} />
      <Contents channel={channel} chatList={chatList} />
      <FloatingBar>
        <FloatingInputContainer>
          <IconButton background={IconAttachment} style={{ width: '24px', height: '24px', marginLeft: '18px', marginRight: '12px', marginTop: '13.5px' }} />
          <IconButton background={IconEmoji} style={{ width: '24px', height: '24px', marginTop: '13.5px' }} />
          <FloatingInput value={text} onChange={onChange} onKeyPress={onKeyPress} />
          <IconButton onClick={event => sendMessage()} background={IconSend} style={{ width: '24px', height: '24px', position: 'absolute', top: '33.5px', right: '38px' }} />
        </FloatingInputContainer>
      </FloatingBar>
    </Wrapper>
  );
};

export default Chatroom;
