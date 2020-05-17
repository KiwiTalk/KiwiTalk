import React from 'react';
import styled from 'styled-components';

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
  target: any, // Chat
}

export const ReplyChat: React.FC<ReplyChatProps> = (chat: ReplyChatProps) => {
  return (
    <Wrapper>
      <ReplyTarget>{chat.target.text}</ReplyTarget>
    </Wrapper>
  );
};

export default ReplyChat;
