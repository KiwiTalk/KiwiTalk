import { Chat, ChatChannel, ChatType, FeedType } from 'node-kakao';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import ThemeColor from '../../assets/colors/theme';
import Strings from '../../constants/Strings';
import useMessage from '../../hooks/useMessage';
import KakaoManager from '../../KakaoManager';
import { ReducerType } from '../../reducers';
import ChatBubble from './items/ChatBubble';

import ChatItem from './items/ChatItem';

import convertChat from './utils/ChatConverter';
import { toDeletedAt } from './utils/FeedConverter';

const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow-y: scroll;
  overflow-x: hidden;
  z-index: 1;

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

const getContent = (chat: Chat, chatList: Chat[], channel: ChatChannel) => {
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

const renderItem = (startAt: number, select: string) => {
  const chatList = KakaoManager.chatList.get(select) ?? [];
  const channel = KakaoManager.getChannel(select);

  const bubbles = [];
  let nextWithAuthor = true;
  for (let i = startAt; ; i++) {
    const chat = chatList[i];
    if (!chat) {
      return {
        index: i - startAt,
        value: null,
      };
    }

    const isMine = chat.Sender.isClientUser();

    const willSenderChange = chatList.length - 1 === i ||
      !chatList[i + 1].Sender.Id.equals(chat.Sender.Id);

    const sendDate = new Date(chat.SendTime * 1000);

    if (chat.Type !== ChatType.Feed) {
      bubbles.push({
        key: chat.LogId.toString(),
        hasTail: willSenderChange && ChatTypeWithTail.includes(chat.Type),
        unread: 1,
        author: nextWithAuthor ?
          channel.getUserInfo(chat.Sender)?.Nickname ?? '' :
          '',
        isMine,
        time: sendDate,
        hasPadding: ChatTypeWithPadding.includes(chat.Type),
        chat,
      });
    } else {
      return {
        index: i - startAt + 1,
        value: getContent(chat, chatList, channel),
      };
    }

    nextWithAuthor = false;

    if (willSenderChange && bubbles.length > 0) {
      const chatItem = (
        <ChatItem
          isMine={isMine}
          profileImageSrc={channel.getUserInfo(chat.Sender)?.ProfileImageURL}
          key={chat.LogId.toString()}>
          {
            bubbles.map((bubble) => {
              return (
                <ChatBubble
                  chatId={bubble.key}
                  key={bubble.key}
                  hasTail={bubble.hasTail}
                  time={bubble.time}
                  author={bubble.author}
                  unread={bubble.unread}
                  isMine={bubble.isMine}
                  hasPadding={bubble.hasPadding}>
                  {
                    getContent(bubble.chat, chatList, channel)
                  }
                </ChatBubble>
              );
            })
          }
        </ChatItem>
      );

      return {
        index: i - startAt + 1,
        value: chatItem,
      };
    }
  }
};

const ChatList = (): JSX.Element => {
  const select = useSelector((state: ReducerType) => state.chat.select);

  const bottomRef = useRef<InfiniteScroll>(null);
  const [isScroll, setScroll] = useState(true);
  const [list, setList] = useState<{ index: number[]; value: JSX.Element[] }>({
    index: [],
    value: [],
  });
  const [end, setEnd] = useState(false);

  const newMessage = useMessage(select);

  const init = useCallback(() => {
    const result: number[] = [];
    const array = [];
    for (let i = 0; i < 20; i++) {
      const { index: _index, value } = renderItem(
          result.reduce((pre, cur) => pre + cur, 0) + 1,
          select,
      );

      if (!value) break;

      result.push(_index);
      array.push(value);
    }

    setList({
      index: result,
      value: array,
    });
  }, [select]);

  useEffect(init, []);
  useEffect(init, [select]);

  useEffect(() => {
    let startAt = list.index.slice(0, -1).reduce((pre, cur) => pre + cur, 0) + 1;

    const newIndex = list.index.slice(0, -1);
    const result = list.value.slice(0, -1);
    for (;;) {
      const item = renderItem(
          startAt,
          select,
      );

      if (!item.value) {
        setEnd(true);

        break;
      }

      startAt += item.index;
      result.push(item.value);
      newIndex.push(item.index);
    }

    if (end) {
      setList({
        index: newIndex,
        value: result,
      });
    }
    if (isScroll) {
      const target = bottomRef.current?.getScrollableTarget();
      if (target) {
        target.scrollTo({
          top: target.scrollHeight * 2,
          behavior: 'smooth',
        });
      }
    }
  }, [newMessage]);

  const fetchData = useCallback(() => {
    const result = list.index;
    const array = [];
    for (let i = 0; i < 10; i++) {
      const { index: _index, value } = renderItem(
          result.reduce((pre, cur) => pre + cur, 0) + 1,
          select,
      );

      if (!value) break;

      result.push(_index);
      array.push(value);
    }

    setList({
      index: result,
      value: list.value.concat(array),
    });
  }, [list, select]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onScroll = useCallback((event: any) => {
    const num = Math.abs(event.target.scrollHeight - event.target.scrollTop - 638);
    if (num < 600 && !isScroll) setScroll(true);
    else if (num >= 600 && isScroll) {
      setScroll(false);
    }
  }, []);

  return (
    <>
      <Content id={'chat-list-parent'}>
        <InfiniteScroll
          ref={bottomRef}
          onScroll={onScroll}
          style={{ overflow: 'hidden' }}
          scrollableTarget={'chat-list-parent'}
          dataLength={list.index.reduce((pre, cur) => pre + cur, 0)}
          next={fetchData}
          hasMore={true}
          loader={null}>
          {list.value}
        </InfiniteScroll>
      </Content>
    </>
  );
};

export default ChatList;
