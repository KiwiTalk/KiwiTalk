import React from 'react';
import styled from 'styled-components';
import IconButton from './IconButton';
import IconExternal from '../../assets/images/icon_external.svg';
import IconMenu from '../../assets/images/icon_menu.svg';
import IconNotificationDisabled from '../../assets/images/icon_notification_disabled.svg';
import IconNotification from '../../assets/images/icon_notification.svg';
import IconSearch from '../../assets/images/icon_search.svg';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  background: #FFFFFF;
`;

const Title = styled.span`
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 37px;
  color: #000000;
  padding: 16px 32px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const IconButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 182px;
  justify-content: space-between;
  align-items: center;
  padding: 0px 10px;
  margin-right: 35px;
  box-sizing: border-box;
`;

interface ChatroomHeaderProps {
  title: string
}

const ChatroomHeader: React.FC<ChatroomHeaderProps> = ({title}) => {
  return (
    <Wrapper>
      <Title>{title}</Title>
      <IconButtonWrapper>
        <IconButton background={IconNotification}/>
        <IconButton background={IconSearch}/>
        <IconButton background={IconExternal}/>
        <IconButton background={IconMenu}/>
      </IconButtonWrapper>
    </Wrapper>
  );
};

export default ChatroomHeader;
