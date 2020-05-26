import React from 'react';
import styled from 'styled-components';

import { Chat, ChatType } from 'node-kakao/dist';

import { toPhoto } from './ConvertChat';

import color from '../../assets/colors/theme';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const ReplyTarget = styled.div`
  background-color: rgba(0, 0, 0, 0.1);
  width: auto;
  max-width: 100%;
  margin: 8px;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`

const Author = styled.span((props: { isMine: boolean }) => `
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  line-height: 17px;
  color: ${props.isMine ? '#000000' : color.BLUE_300};
`);

interface ReplyChatProps {
  me: Chat,
  prevChat: Chat, // Chat
}

export const ReplyChat: React.FC<ReplyChatProps> = (chat: ReplyChatProps) => {
  let content = <span>{chat.prevChat.Text}</span>

  switch (chat.prevChat.Type) {
    case ChatType.Photo: case ChatType.MultiPhoto:
      content = toPhoto(chat.prevChat, {
        ratio: 1,
        limit: [100, 100]
      });
      break;
  }

  return (
    <Wrapper>
      <ReplyTarget>
        <Author isMine={chat.me.Sender.Id.toString() === chat.prevChat.Sender.Id.toString()}>{`${chat.prevChat.Sender.Nickname}에게 답장`}</Author>
        {content}
      </ReplyTarget>
      <span>{chat.me.Text}</span>
    </Wrapper>
  );
};

export default ReplyChat;
