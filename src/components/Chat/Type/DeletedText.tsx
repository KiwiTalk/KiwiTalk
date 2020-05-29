import React from 'react';
import styled from 'styled-components';

import {Chat} from 'node-kakao/dist';

import convertChat from '../Utils/ChatConverter';

const ReactSpoiler = require('react-spoiler');

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
            <NoticeText><b>삭제된 메시지 입니다.</b></NoticeText>
            <ReactSpoiler blur={10} hoverBlur={8}>
                {content}
            </ReactSpoiler>
        </Wrapper>
    );
};

export default DeletedText;
