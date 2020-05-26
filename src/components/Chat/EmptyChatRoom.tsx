import React from 'react';
import styled from 'styled-components';

import ChatRoomColor from '../../assets/colors/chatroom';

import kiwi from '../../assets/images/kiwi.svg';

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  background: ${ChatRoomColor.BACKGROUND};
  flex: 1;
  min-width: 0;
  justify-content: center;
  align-items: center;
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 25px;
`


const Kiwi = styled.img`
  position: fixed;
  width: 70vw;
  height: 70vh;
  right: -10%;
  bottom: -33%;
  mix-blend-mode: overlay;
  opacity: 0.5;
`;


const EmptyChatRoom = () => {
  return (
    <Wrapper>
      <Kiwi src={kiwi} />
      <p>채팅방을 선택하세요</p>
    </Wrapper>
  )
};

export default EmptyChatRoom;