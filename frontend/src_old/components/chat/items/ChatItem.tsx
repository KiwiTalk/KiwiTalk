import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';
import ProfileDefault from '../../../assets/images/profile_default.svg';
import ProfileImage from '../../common/ProfileImage';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  
  margin: 4px 0;
`;

const Contents = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const StyledProfileImage = styled(ProfileImage)`
  margin-right: 8px;
`;

export interface ChatItemProps extends HTMLAttributes<HTMLDivElement> {
  isMine: boolean;
  profileVisible?: boolean;
  profileImageSrc?: string;
  ignoreSize?: boolean;
}

const ChatItem: React.FC<ChatItemProps> = ({
  isMine,
  profileVisible,
  profileImageSrc,
  ignoreSize,
  children,
  ...args
}) => {
  const src = profileImageSrc ? profileImageSrc : ProfileDefault;

  return (
    <Wrapper {...args}>
      {
        (profileVisible ?? true) && !isMine ?
          <StyledProfileImage
            src={src}
            style={
              ignoreSize ? {
                position: 'absolute',
              } : {}
            }
          /> :
        null
      }
      <Contents
        style={
          !profileVisible || ignoreSize ?
            {
              marginLeft: 48 + 8,
            } :
            {}
        }
      >
        {children}
      </Contents>
    </Wrapper>
  );
};

export default ChatItem;
