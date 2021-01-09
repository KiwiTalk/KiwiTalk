import { Chat, ChatChannel } from 'node-kakao';
import React from 'react';
import styled from 'styled-components';
import convertChat from '../utils/chat-converter';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 9999px;
  color: black;
  padding: 4px;

  margin: 16px 8px 8px 8px;
`;

const Content = styled.span`
  text-align: center;
  margin: 8px;
`;

const InnerContent = styled.span`
  text-align: center;
  
  margin: 2px;
  padding: 12px 8px;
  
  background-color: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 9999px;
  
  filter: blur(4px);
  
  transition: all 0.25s;
  
  :hover {
    filter: blur(0px);
  }
`;

interface DeletedAtProps {
  sender?: string;
  chat?: Chat;
  chatList: Chat[];
  channel: ChatChannel;
}

export const DeletedAt: React.FC<DeletedAtProps> = ({ sender, chat, chatList, channel }) => {
  return (
    <Wrapper>
      <Content>
        {sender ? `${sender}님이` : '누군가가'}
        <InnerContent>
          {chat ? convertChat(chat, chatList, channel, true) : '알 수 없는'}
        </InnerContent>
        채팅을 삭제하였습니다.
      </Content>
    </Wrapper>
  );
};

export default DeletedAt;
