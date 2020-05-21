import React from 'react';
import styled from 'styled-components';

import {Chat} from 'node-kakao/dist';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const ReplyTarget = styled.div`
  background-color: #F6F6F6;
  margin: 8px;
  padding: 8px;
  border-radius: 8px;
`

interface ReplyChatProps {
    me: Chat,
    prevChat: Chat, // Chat
}

export const ReplyChat: React.FC<ReplyChatProps> = (chat: ReplyChatProps) => {
    return (
        <Wrapper>
            <ReplyTarget>{chat.prevChat.Text}</ReplyTarget>
            <a>{chat.me.Text}</a>
        </Wrapper>
    );
};

export default ReplyChat;
