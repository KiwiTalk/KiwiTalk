import { Chat, TalkChannel, ChatType, FeedType, Long } from 'node-kakao';
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
  ChatType.Text,
  ChatType.Search,
  ChatType.Reply,
];

const ChatTypeWithPadding = [
  ChatType.Text,
  ChatType.Search,
  ChatType.Reply,
];

const getContent = (chat: Chat, chatList: Chat[], channel: TalkChannel) => {
  if (chat.Type === ChatType.Feed) {
    try {
      const text = JSON.parse(chat.Text);

      if (text.feedType === FeedType.DELETE_TO_ALL) {
        return toDeletedAt(chat.getFeed(), chat, chatList, channel);
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

  const render = useCallback((index: number, chat: Chat) => {
    if (!chatList) return null;

    if (chat.Type === ChatType.Feed) {
      return getContent(chat, chatList, chat.Channel);
    }

    const willSenderChange = chatList.length - 1 === index ||
      !chatList[index + 1]?.Sender?.Id?.equals?.(chat.Sender.Id);
    const nicknameInvisible = chatList[index - 1]?.Sender?.Id?.equals?.(chat.Sender.Id);

    return (
      <ChatItem
        isMine={chat.Sender.isClientUser()}
        profileVisible={willSenderChange}
        profileImageSrc={chat.Channel.getUserInfo(chat.Sender)?.ProfileImageURL}
        ignoreSize={willSenderChange && nicknameInvisible}
        key={chat.LogId.toString()}>
        <ChatBubble
          chatId={chat.LogId.toString()}
          key={chat.LogId.toString()}
          hasTail={willSenderChange && ChatTypeWithTail.includes(chat.Type)}
          time={new Date(chat.SendTime * 1000)}
          author={nicknameInvisible ? '' : chat.Channel.getUserInfo(chat.Sender)?.Nickname}
          unread={1}
          isMine={chat.Sender.isClientUser()}
          hasPadding={ChatTypeWithPadding.includes(chat.Type)}>
          {
            getContent(chat, chatList, chat.Channel)
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
    if (chatList && autoScroll && newMessage?.LogId.equals(lastChatId ?? 0) === false) {
      ref.current?.scrollToIndex({
        index: chatList.length,
        align: 'end',
        behavior: 'smooth',
      });

      setLastChatId(newMessage?.LogId);
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
