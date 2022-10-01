import React from 'react';
import styled from 'styled-components';
import { IconButton } from '@material-ui/core';

import color from '../../../../assets/colors/theme';

import IconExternal from '../../../../assets/images/icon_external.svg';
import IconMenu from '../../../../assets/images/icon_menu.svg';
import IconNotification from '../../../../assets/images/icon_notification.svg';
import IconSearch from '../../../../assets/images/icon_search.svg';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  background: ${color.GREY_900};
`;

const Title = styled.span`
  height: 36px;
  
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 36px;
  color: ${color.GREY_100};
  padding: 8px 16px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const IconButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: right;
  align-items: center;
  box-sizing: border-box;
  
  margin-right: 8px;
`;

const StyledIconButton = styled(IconButton)`
  width: 36px;
  height: 36px;
`;

interface ChatroomHeaderProps {
    title: string
}

const Header: React.FC<ChatroomHeaderProps> = ({ title }) => {
  return (
    <Wrapper>
      <Title>{title}</Title>
      <IconButtonWrapper>
        <StyledIconButton>
          <img src={IconNotification} />
        </StyledIconButton>
        <StyledIconButton>
          <img src={IconSearch} />
        </StyledIconButton>
        <StyledIconButton>
          <img src={IconExternal} />
        </StyledIconButton>
        <StyledIconButton>
          <img src={IconMenu} />
        </StyledIconButton>
      </IconButtonWrapper>
    </Wrapper>
  );
};

export default Header;
