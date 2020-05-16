import React, { useState, HTMLAttributes } from 'react';
import styled from 'styled-components';
import ProfileImage from './ProfileImage';

const Wrapper = styled.div`
  width: 309px;
  height: 89px;
  padding: 14px 25px;
  box-sizing: border-box;
`;

const Content = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Text = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 17px;
`;

const Username = styled.span`
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 25px;
  color: #000000;
  width: 188px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LastChat = styled.span`
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  color: #808080;
  word-break: keep-all;
`;

interface ChatListItemProps extends HTMLAttributes<HTMLDivElement> {
  profileImageSrc: string
  username: string
  lastChat: string
}

const ChatListItem: React.FC<ChatListItemProps> = ({profileImageSrc, username, lastChat, ...args}) => {
  const [hover, setHover] = useState(false);
  return (
    <Wrapper style={hover ? { backgroundColor: '#F7F7F7' } : { backgroundColor: '#FFFFFF' }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} {...args}>
      <Content>
        <ProfileImage src={profileImageSrc} focus={hover} />
        <Text>
          <Username>{username}</Username>
          <LastChat>{lastChat || '\u200b'}</LastChat>
        </Text>
      </Content>
    </Wrapper>
  );
};

export default ChatListItem;
