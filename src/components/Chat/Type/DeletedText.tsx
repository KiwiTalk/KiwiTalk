import React from 'react';
import styled from 'styled-components';

import {Chat} from 'node-kakao/dist';

import convertChat from '../Utils/ChatConverter';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;
`;

const NoticeText = styled.div`
    color: rgba(0, 0, 0, 0.5);
    padding: 4px;
`;

const BlurredDiv = styled.div`
    -webkit-filter: blur(10px);
    filter: blur(10px);

    transition: all 0.25s;

    :hover {
        -webkit-filter: blur(0px);
        filter: blur(0px);
    }
`

interface DeletedTextProps {
    chat: Chat
    chatList: Chat[]
}

export const DeletedText: React.FC<DeletedTextProps> = ({ chat, chatList }) => {
    const content = convertChat(chat, chatList)
    
    return (
        <Wrapper>
            <NoticeText><b>삭제된 메시지 입니다.</b></NoticeText>
            <BlurredDiv>
                {content}
            </BlurredDiv>
        </Wrapper>
    );
};

export default DeletedText;
