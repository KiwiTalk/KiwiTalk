import React, { useState, HTMLAttributes } from 'react';
import styled from 'styled-components';
import ChatroomHeader from './ChatroomHeader';
import { ChatChannel } from '../../../public/src/NodeKakaoPureObject';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: #E8E8E8;
  flex: 1;
`;

interface ChatroomProps {
  channel: ChatChannel
}

const Chatroom: React.FC<ChatroomProps> = ({channel}) => {
  return (
    <Wrapper>
      <ChatroomHeader title={channel.channelInfo.name} />
    </Wrapper>
  );
};

export default Chatroom;
