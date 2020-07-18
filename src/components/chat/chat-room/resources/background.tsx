import React from 'react';
import styled from 'styled-components';
import Kiwi from '../../../common/kiwi';
import ChatRoomColor from '../../../../assets/colors/chatroom';

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  background: ${ChatRoomColor.BACKGROUND};
  flex: 1;
  min-width: 0;
`;

const Background: React.FC = ({children}) => {
    return (
        <Wrapper>
            <Kiwi/>
            {children}
        </Wrapper>
    )
};

export default Background;
