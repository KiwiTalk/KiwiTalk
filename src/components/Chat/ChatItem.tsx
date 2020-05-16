import React, { useState, HTMLAttributes } from 'react';
import styled from 'styled-components';
import ProfileImage from './ProfileImage';
import color from '../../assets/javascripts/color';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

interface ChatItemProps extends HTMLAttributes<HTMLDivElement> {
  profileImageSrc: string
}

const ChatItem: React.FC<ChatItemProps> = ({profileImageSrc, children, ...args}) => {
  return (
    <Wrapper {...args}>
      <ProfileImage src={profileImageSrc} focus={true} style={{marginRight: '15px'}} />
      <Content>
        {children}
      </Content>
    </Wrapper>
  );
};

export default ChatItem;
