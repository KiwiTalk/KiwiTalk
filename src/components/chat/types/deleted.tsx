import React, { useRef } from 'react';
import styled from 'styled-components';

import { Chat } from 'node-kakao/dist';

import convertChat from '../utils/chat-converter';

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
    `
    } else {
        element.style = `
        -webkit-filter: blur(0px);
        filter: blur(0px);
    
        transition: all 0.25s;
    `
    }
}

interface DeletedTextProps {
    chat: Chat
    chatList: Chat[]
}

export const Deleted: React.FC<DeletedTextProps> = ({ chat, chatList }) => {
    const content = convertChat(chat, chatList);
    const target = useRef(null);

    let isBlurred = true;
    const hoverIn = (event: any) => {
        blur(target.current, false);
    }

    const hoverOut = (event: any) => {
        blur(target.current, isBlurred);
    }

    const click = (event: any) => {
        isBlurred = !isBlurred;

        blur(target.current, isBlurred);
    }

    return (
        <Wrapper>
            <NoticeText><b>삭제된 메시지 입니다.</b></NoticeText>
            <div ref={target}
                style={{
                    filter: 'blur(10px)',
                    transition: 'all 0.25s'
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
