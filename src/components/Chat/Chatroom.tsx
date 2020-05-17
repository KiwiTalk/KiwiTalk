import React, {ChangeEvent, KeyboardEvent, useState} from 'react';
import styled from 'styled-components';
import ChatroomHeader from './ChatroomHeader';
import IconButton from '../UiComponent/IconButton';
import color from '../../assets/javascripts/color';
import IconAttachment from '../../assets/images/icon_attachment.svg';
import IconEmoji from '../../assets/images/icon_emoji.svg';
import IconSend from '../../assets/images/icon_send.svg';
import Bubble from '../UiComponent/Bubble';
import ChatItem from './ChatItem';

import {Chat, ChatChannel, ChatType} from "node-kakao/dist";

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
  padding: 46px 27px 96px 42px;
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
      chatList.filter((chat) => chat.Type === ChatType.Text && chat.Channel.Id.low === channel.Id.low).map((chat, index, arr) => {
        const isMine = (chat.Sender == undefined) || chat.Sender.isClientUser();
        let willSenderChange = arr.length - 1 === index;

        if (isMine) willSenderChange = willSenderChange || arr[index + 1].Sender !== undefined;
        else willSenderChange = willSenderChange || arr[index + 1].Sender?.Id.low !== chat.Sender?.Id.low;

        const sendDate = new Date(chat.SendTime)

        bubbles.push(<Bubble key={chat.MessageId}
                             hasTail={willSenderChange}
                             unread={1}
                             author={nextWithAuthor ? chat.Sender?.Nickname : ''}
                             isMine={isMine}
                             time={`${sendDate.getHours()}:${sendDate.getMinutes()}`}>{chat.Text}</Bubble>);
        
        nextWithAuthor = false;

        if (willSenderChange) {
          const chatItem = <ChatItem
              profileImageSrc={channel["channelInfo"].userInfoMap[chat.Sender?.Id.low]?.profileImageURL}
              key={chat.MessageId}>{bubbles}</ChatItem>
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
    if (!channel.Id) return;
    if (text.length <= 0) return;

    channel.sendText(text)
        .then(result => {
          text = '';
          setText(text);
        })
        .catch(error => {
          alert('메시지 발송 중 오류 발생');
        });
  }

  return (
    <Wrapper>
      <ChatroomHeader title={channel["channelInfo"].name}/>
      <Contents channel={channel} chatList={chatList}/>
      <FloatingBar>
        <FloatingInputContainer>
          <IconButton background={IconAttachment} style={{
            width: '24px',
            height: '24px',
            marginLeft: '18px',
            marginRight: '12px',
            marginTop: '13.5px'
          }}/>
          <IconButton background={IconEmoji} style={{width: '24px', height: '24px', marginTop: '13.5px'}}/>
          <FloatingInput value={text} onChange={onChange} onKeyPress={onKeyPress}/>
          <IconButton onClick={event => sendMessage()} background={IconSend}
                      style={{width: '24px', height: '24px', position: 'absolute', top: '33.5px', right: '38px'}}/>
        </FloatingInputContainer>
      </FloatingBar>
    </Wrapper>
  );
};

export default Chatroom;
