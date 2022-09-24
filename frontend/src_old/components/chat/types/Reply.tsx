import React from 'react';
import styled from 'styled-components';

import { Chatlog, TalkChannel } from 'node-kakao';

import { convertShortChat } from '../utils/ChatConverter';

import color from '../../../assets/colors/theme';

const Wrapper = styled.div((props: { isMine: boolean }) => `
  display: flex;
  flex-direction: column;
  align-items: ${props.isMine ? 'flex-end' : 'flex-start'};
`);

const ReplyTarget = styled.div((props: { isMine: boolean }) => `
  background-color: rgba(0, 0, 0, 0.1);
  width: auto;
  max-width: 100%;
  margin: 8px;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: ${props.isMine ? 'flex-end' : 'flex-start'};
  cursor: pointer;
  
  transition: all 0.25s;
  
  :hover {
    transform: scale(1.05);
  }
  :active {
    transform: scale(0.95);
  }
`);

const Author = styled.span((props: { isMine: boolean }) => `
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  line-height: 17px;
  color: ${props.isMine ? '#000000' : color.BLUE_300};
  margin-bottom: 4px;
`);

const Content = styled.div`
  display: flex;
  flex-flow: row;
  white-space: pre-line;
`;

interface ReplyChatProps {
  me: Chatlog,
  prevChat: Chatlog,
  channel: TalkChannel;
  onClick: () => void;
}

export const Reply: React.FC<ReplyChatProps> = (chat: ReplyChatProps) => {
  const content = convertShortChat(chat.prevChat);
  const isMyChat = true; // TODO

  return (
    <Wrapper isMine={isMyChat}>
      <ReplyTarget isMine={isMyChat} onClick={chat.onClick}>
        <Author isMine={false}>{
          `${
            chat.channel.getUserInfo(chat.prevChat.sender)?.nickname
          }에게 답장`
        }</Author>
        {content}
      </ReplyTarget>
      <Content>{chat.me.text}</Content>
    </Wrapper>
  );
};

export default Reply;
