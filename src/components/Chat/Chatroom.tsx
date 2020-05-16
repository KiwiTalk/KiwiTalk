import React from 'react';
import styled from 'styled-components';
import ChatroomHeader from './ChatroomHeader';
import { ChatChannel } from '../../../public/src/NodeKakaoPureObject';
import color from '../../assets/javascripts/color';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: ${color.BACKGROUND};
  flex: 1;
  min-width: 0;
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
