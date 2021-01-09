import React from 'react';
import styled from 'styled-components';

import ChatRoomColor from '../../../assets/colors/chatroom';

import Kiwi from '../../common/Kiwi';

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
`;

const EmptyChatRoom = () => {
  return (
    <Wrapper>
      <Kiwi/>
      <p><b>채팅방을 선택하세요</b></p>
    </Wrapper>
  );
};

export default EmptyChatRoom;
