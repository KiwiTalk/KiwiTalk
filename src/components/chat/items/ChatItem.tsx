import React, { HTMLAttributes, useMemo } from 'react';
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
}

const ChatItem: React.FC<ChatItemProps> = ({
  isMine,
  profileVisible,
  profileImageSrc,
  children,
  ...args
}) => {
  const src = profileImageSrc ? profileImageSrc : ProfileDefault;
  const profile = useMemo(() => <StyledProfileImage src={src} />, []);

  return (
    <Wrapper {...args}>
      {
        (profileVisible ?? true) && !isMine ? profile : null
      }
      <Contents>
        {children}
      </Contents>
    </Wrapper>
  );
};

export default ChatItem;
