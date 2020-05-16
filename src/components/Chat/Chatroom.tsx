import React from 'react';
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
  position: absolute;
  display: flex;
  bottom: 14px;
  left: 48px;
  right: 47px;
`

const FloatingIcons = styled.div`
  display: flex;
  margin-right: 6px;
  background: ${color.GREY_800};
  padding: 20px 24px;
`

const FloatingInputContainer = styled.div`
  display: flex;
  flex: 1;
  background: ${color.GREY_800};
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
`;

interface ChatroomProps {
  channel: ChatChannel
  chatList: Chat[]
}

const Chatroom: React.FC<ChatroomProps> = ({channel, chatList}) => {
  const getContent = () => {
    let bubbles: JSX.Element[] = [];
    return chatList.filter((chat) => chat.type === ChatType.Text && chat.channel.id.low === channel.id.low).map((chat, index, arr) => {
      const willSenderChange = arr.length - 1 === index || arr[index + 1].sender.id.low !== chat.sender.id.low;
      const sendDate = new Date(chat.sendTime)
      bubbles.push(<Bubble hasTail={willSenderChange} unread={1} author={chat.sender.nickname} time={`${sendDate.getHours()}:${sendDate.getMinutes()}`}>
        {chat.text}
      </Bubble>);
      if (willSenderChange) {
        const chatItem = <ChatItem profileImageSrc={channel.channelInfo.userInfoMap[chat.sender.id.low].profileImageURL}>
          {bubbles}
        </ChatItem>
        bubbles = []
        return chatItem;
      }
    });
  }
  return (
    <Wrapper>
      <ChatroomHeader title={channel.channelInfo.name} />
      <Content>
        {getContent()}
      </Content>
      <FloatingBar>
        <FloatingIcons>
          <IconButton background={IconAttachment} style={{ width: '24px', height: '24px', marginRight: '24px'}} />
          <IconButton background={IconEmoji} style={{ width: '24px', height: '24px'}} />
        </FloatingIcons>
        <FloatingInputContainer>
          <FloatingInput />
          <IconButton background={IconSend} style={{ width: '24px', height: '24px', position: 'absolute', top: '20px', right: '20px' }} />
        </FloatingInputContainer>
      </FloatingBar>
    </Wrapper>
  );
};

export default Chatroom;
