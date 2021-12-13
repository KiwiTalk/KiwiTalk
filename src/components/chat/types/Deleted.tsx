import React, { useRef } from 'react';
import styled from 'styled-components';

import { Chatlog, TalkChannel } from 'node-kakao';

import convertChat from '../utils/ChatConverter';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;
`;

const NoticeText = styled.div`
    color: rgba(0, 0, 0, 0.5);
    padding: 4px;
`;

const blur = (element: any, isBlur: boolean) => {
  if (isBlur) {
    element.style = `
        -webkit-filter: blur(10px);
        filter: blur(10px);
    
        transition: all 0.25s;
    `;
  } else {
    element.style = `
        -webkit-filter: blur(0px);
        filter: blur(0px);
    
        transition: all 0.25s;
    `;
  }
};

interface DeletedTextProps {
    chat: Chatlog;
    chatList: Chatlog[];
    channel: TalkChannel;
}

export const Deleted: React.FC<DeletedTextProps> = ({ chat, chatList, channel }) => {
  const content = convertChat(chat, chatList, channel, true);
  const target = useRef(null);

  let isBlurred = true;
  const hoverIn = () => {
    blur(target.current, false);
  };

  const hoverOut = () => {
    blur(target.current, isBlurred);
  };

  const click = () => {
    isBlurred = !isBlurred;

    blur(target.current, isBlurred);
  };

  return (
    <Wrapper>
      <NoticeText><b>삭제된 메시지 입니다.</b></NoticeText>
      <div ref={target}
        style={{
          filter: 'blur(10px)',
          transition: 'all 0.25s',
        }}
        onClick={click}
        onMouseOver={hoverIn}
        onMouseOut={hoverOut}>
        {content}
      </div>
    </Wrapper>
  );
};

export default Deleted;
