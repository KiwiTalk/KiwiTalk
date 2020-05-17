import React, { useState, HTMLAttributes } from 'react';
import styled from 'styled-components';
import ProfileImage, { ProfileImageBackgroundColor } from '../UiComponent/ProfileImage';
import color from '../../assets/javascripts/color';

const Wrapper = styled.div`
  width: 309px;
  height: 89px;
  padding: 14px 25px;
  box-sizing: border-box;
  cursor: pointer;
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
  flex: 1;
`;

const Username = styled.span`
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 25px;
  color: ${color.GREY_100};
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
  color: ${color.GREY_400};
  width: 188px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

interface ChatListItemProps extends HTMLAttributes<HTMLDivElement> {
  profileImageSrc: string
  username: string
  lastChat: string
  selected: boolean
}

const ChatListItem: React.FC<ChatListItemProps> = ({profileImageSrc, username, lastChat, selected, ...args}) => {
  const [hover, setHover] = useState(false);
  return (
    <Wrapper style={hover || selected ? { backgroundColor: '#F7F7F7' } : { backgroundColor: '#FFFFFF' }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} {...args}>
      <Content>
        <ProfileImage src={profileImageSrc} backgroundColor={hover || selected ? ProfileImageBackgroundColor.GRAY_800 : ProfileImageBackgroundColor.GRAY_900} />
        <Text>
          <Username>{username}</Username>
          <LastChat>{lastChat || '\u200b'}</LastChat>
        </Text>
      </Content>
    </Wrapper>
  );
};

export default ChatListItem;
