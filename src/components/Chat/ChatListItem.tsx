import React from 'react';
import styled from 'styled-components';
import ProfileImage from './ProfileImage';

const Wrapper = styled.div`
  width: 309px;
  height: 89px;
  background: #F7F7F7;
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
  word-break: keep-all;
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

const ChatListItem: React.FC<{profileImageSrc: string, username: string, lastChat: string}> = ({profileImageSrc, username, lastChat}) => {
  return (
    <Wrapper>
      <Content>
        <ProfileImage src={profileImageSrc} />
        <Text>
          <Username>{username}</Username>
          <LastChat>{lastChat}</LastChat>
        </Text>
      </Content>
    </Wrapper>
  );
};

export default ChatListItem;
