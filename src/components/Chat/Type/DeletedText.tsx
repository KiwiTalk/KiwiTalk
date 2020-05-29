import React from 'react';
import styled from 'styled-components';

import { Chat } from 'node-kakao/dist';

import convertChat from '../Utils/ChatConverter'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;
`;

const NoticeText = styled.div`
    color: rgba(0, 0, 0, 0.5);
    padding: 4px;
`;

interface DeletedTextProps {
    chat: Chat
    chatList: Chat[]
}

export const DeletedText: React.FC<DeletedTextProps> = ({ chat, chatList }) => {
    const content = convertChat(chat, chatList)

    return (
        <Wrapper>
            <NoticeText>삭제된 메시지 입니다.</NoticeText>
            {content}    
        </Wrapper>
    );
};

export default DeletedText;
