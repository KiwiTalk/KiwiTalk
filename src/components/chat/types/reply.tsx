import React from 'react';
import styled from 'styled-components';

import {Chat, ChatType} from 'node-kakao/dist';

import {toPhoto} from '../utils/chat-converter';

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
`)

const Author = styled.span((props: { isMine: boolean }) => `
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  line-height: 17px;
  color: ${props.isMine ? '#000000' : color.BLUE_300};
  margin-bottom: 4px;
`);

const Content = styled.span`
    white-space: pre-line;
`;

interface ReplyChatProps {
  me: Chat,
  prevChat: Chat, // Chat
}

export const Reply: React.FC<ReplyChatProps> = (chat: ReplyChatProps) => {
  let content = <Content>{chat.prevChat.Text}</Content>

  switch (chat.prevChat.Type) {
    case ChatType.Photo:
    case ChatType.MultiPhoto:
      content = toPhoto(chat.prevChat, {
        ratio: 1,
        limit: [50, 50]
      });
      break;
  }

  const isMine = chat.me.Sender.Id.toString() === chat.prevChat.Sender.Id.toString()
  const isMyChat = chat.me.Sender.Id.toString() === chat.me.Channel.Client.ClientUser.Id.toString();

  return (
    <Wrapper isMine={isMyChat}>
      <ReplyTarget isMine={isMyChat}>
        <Author isMine={isMine}>{`${chat.prevChat.Sender.Nickname}에게 답장`}</Author>
        {content}
      </ReplyTarget>
      <Content>{chat.me.Text}</Content>
    </Wrapper>
  );
};

export default Reply;
