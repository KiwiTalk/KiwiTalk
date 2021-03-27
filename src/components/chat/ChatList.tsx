import { TalkChannel, Long, Chatlog, KnownChatType, KnownFeedType } from 'node-kakao';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import ThemeColor from '../../assets/colors/theme';
import Strings from '../../constants/Strings';
import KakaoManager from '../../KakaoManager';
import { ReducerType } from '../../reducers';
import ChatBubble from './items/ChatBubble';

import ChatItem from './items/ChatItem';

import convertChat from './utils/ChatConverter';
import { toDeletedAt } from './utils/FeedConverter';
import EmptyChatRoom from './chatroom/EmptyChatRoom';
import useMessage from '../../hooks/useMessage';

const Wrapper = styled.div`
  padding: 16px;

  ::-webkit-scrollbar {
    width: 6px;
    border-radius: 3px;
    background: ${ThemeColor.GREY_700};
  }

  ::-webkit-scrollbar-thumb {
    background: ${ThemeColor.GREY_400};
    border-radius: 3px;
  }
`;

const ChatTypeWithTail = [
  KnownChatType.TEXT,
  KnownChatType.SEARCH,
  KnownChatType.REPLY,
];

const ChatTypeWithPadding = [
  KnownChatType.TEXT,
  KnownChatType.SEARCH,
  KnownChatType.REPLY,
];

const getContent = (chat: Chatlog, chatList: Chatlog[], channel: TalkChannel) => {
  if (chat.text && chat.type === KnownChatType.FEED) {
    try {
      const text = JSON.parse(chat.text);

      if (text.feedType === KnownFeedType.DELETE_TO_ALL) {
        // return toDeletedAt(chat.attachment, chat, chatList, channel);
      }
    } catch {
      return <div>{Strings.Error.UNKNOWN}</div>;
    }
  }

  return convertChat(chat, chatList, channel) ?? <div>{Strings.Error.UNKNOWN}</div>;
};

const ChatList = (): JSX.Element => {
  const select = useSelector((state: ReducerType) => state.chat.select);
  const newMessage = useMessage(select);

  const ref = useRef<VirtuosoHandle>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [lastChatId, setLastChatId] = useState<Long>();

  const chatList = KakaoManager.chatList.get(select);
  const channel = KakaoManager.getChannel(select);

  const render = useCallback((index: number, chat: Chatlog) => {
    if (!chatList) return null;

    if (chat.type === KnownChatType.FEED) {
      return getContent(chat, chatList, channel);
    }

    const willSenderChange = chatList.length - 1 === index ||
      !chatList[index + 1].sender.userId.equals(chat.sender.userId);
    const nicknameInvisible = chatList[index - 1].sender.userId.equals(chat.sender.userId);

    const isMine = channel.clientUser.userId.equals(chat.sender.userId);

    return (
      <ChatItem
        isMine={isMine}
        profileVisible={willSenderChange}
        profileImageSrc={channel.getUserInfo(chat.sender)?.fullProfileURL}
        ignoreSize={willSenderChange && nicknameInvisible}
        key={chat.logId.toString()}>
        <ChatBubble
          chatId={chat.logId.toString()}
          key={chat.logId.toString()}
          hasTail={willSenderChange && ChatTypeWithTail.includes(chat.type)}
          time={new Date(chat.sendAt * 1000)}
          author={nicknameInvisible ? '' : channel.getUserInfo(chat.sender)?.nickname}
          unread={1}
          isMine={isMine}
          hasPadding={ChatTypeWithPadding.includes(chat.type)}>
          {
            getContent(chat, chatList, channel)
          }
        </ChatBubble>
      </ChatItem>
    );
  }, [chatList]);

  const onRangeChange = useCallback(({ endIndex }: { endIndex: number }) => {
    if (!autoScroll && endIndex + 10 > (chatList?.length ?? 0)) setAutoScroll(true);
    else if (autoScroll) setAutoScroll(false);
  }, [autoScroll]);

  useEffect(() => {
    if (chatList && autoScroll && newMessage?.logId.equals(lastChatId ?? 0) === false) {
      ref.current?.scrollToIndex({
        index: chatList.length,
        align: 'end',
        behavior: 'smooth',
      });

      setLastChatId(newMessage?.logId);
    }
  }, [newMessage, autoScroll, chatList, lastChatId]);

  if (!chatList) return <EmptyChatRoom />;

  return (
    <Virtuoso
      ref={ref}
      data={chatList}
      itemContent={render}
      rangeChanged={onRangeChange}
      initialTopMostItemIndex={chatList.length ?? 0}
      components={{
        List: React.forwardRef((props, ref) => (
          <Wrapper {...props} ref={ref} />
        )),
        Header: () => <div style={{ width: 'auto', height: 16 }} />,
        Footer: () => <div style={{ width: 'auto', height: 16 }} />,
      }}
    />
  );
};

export default ChatList;
