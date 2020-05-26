import React from 'react';
import styled from 'styled-components';
import kiwi from '../../../../assets/images/kiwi.svg';
import ChatRoomColor from '../../../../assets/colors/chatroom';

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  background: ${ChatRoomColor.BACKGROUND};
  flex: 1;
  min-width: 0;
`;


const Kiwi = styled.img`
position: fixed;
width: 70vw;
height: 70vh;
right: -10%;
bottom: -33%;
mix-blend-mode: overlay;
opacity: 0.5;
`;

const Background: React.FC = ({children}) => {
    return (
        <Wrapper>
            <Kiwi src={kiwi}/>
            {children}
        </Wrapper>
    )
};

export default Background;