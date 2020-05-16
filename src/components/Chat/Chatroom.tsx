import React from 'react';
import styled from 'styled-components';
import ChatroomHeader from './ChatroomHeader';
import { ChatChannel, Chat } from '../../../public/src/NodeKakaoPureObject';
import IconButton from './IconButton';
import color from '../../assets/javascripts/color';
import IconAttachment from '../../assets/images/icon_attachment.svg';
import IconEmoji from '../../assets/images/icon_emoji.svg';
import IconSend from '../../assets/images/icon_send.svg';

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  background: ${color.BACKGROUND};
  flex: 1;
  min-width: 0;
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

const Chatroom: React.FC<ChatroomProps> = ({channel}) => {
  return (
    <Wrapper>
      <ChatroomHeader title={channel.channelInfo.name} />
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
