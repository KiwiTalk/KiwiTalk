import { Chat, ChatChannel, ChatType, FeedType } from 'node-kakao';
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
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
        console.log('deleted', chat);
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
  const chatList = KakaoManager.chatList.get(select) ?? [];

  const bottomRef = useRef<HTMLDivElement>(null);
  const [isScroll, setScroll] = useState(true);

  const newMessage = useMessage(select);


  useEffect(() => {
    if (isScroll || newMessage?.Sender.isClientUser()) {
      bottomRef?.current?.scrollIntoView({
        behavior: 'smooth',
      });

      setScroll(true);
    }
  }, [newMessage]);

  const onScroll = (event: any) => {
    const num = Math.abs(event.target.scrollHeight - event.target.scrollTop - 638);
    if (num < 600 && !isScroll) setScroll(true);
    else if (num >= 600 && isScroll) {
      setScroll(false);
    }
  };

  return useMemo(() => {
    const channel = KakaoManager.getChannel(select);

    const list = [];

    let bubbles = [];
    let nextWithAuthor = true;
    let index = 0;
    for (const chat of chatList) {
      const isMine = chat.Sender.isClientUser();

      const willSenderChange = chatList.length - 1 === index ||
    !chatList[index + 1].Sender.Id.equals(chat.Sender.Id);

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
        list.push(getContent(chat, chatList, channel));
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

        bubbles = [];
        nextWithAuthor = true;

        list.push(chatItem);
      }

      index++;
    }

    return (
      <Content onScroll={onScroll}>
        {list}
        <div ref={bottomRef}/>
      </Content>
    );
  }, [select, chatList[chatList.length - 1] ? chatList[chatList.length - 1].LogId.toString() : '']);
};
/*
class ChatList extends React.Component<ChatListProps> {
  private bubbles: BubbleProps[] = [];
  private nextWithAuthor = true;
  private isScroll = false;

  private refScrollEnd = createRef() as any;
/*
  shouldComponentUpdate(nextProps: ChatListProps, nextState: any): boolean {
    return (
      this.props.chatList.length !== nextProps.chatList.length &&
      this.props.channel.Id.toString() === nextProps
          .chatList[nextProps.chatList.length - 1]
          ?.Channel
          ?.Id
          ?.toString()
    ) || (
      this.props.selectedChannel !== nextProps.selectedChannel
    );
  }
* /
  componentDidUpdate(): void {
    this.isScroll = this.props.chatList[this.props.chatList.length - 1]
        ?.Sender
        ?.isClientUser() ? true : this.isScroll;

    if (this.isScroll) {
      this.refScrollEnd.current.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }

  handleScroll(event: any): void {
    const num = Math.abs(
        event.target.scrollHeight - event.target.scrollTop - 638,
    );

    this.isScroll = num <= 600;
  }

  render(): JSX.Element {
    const list = [];
    const chatList = KakaoManager.chatList.get(select);
    let index = 0;
    for (const chat of chatList) {
      const isMine = (chat.Sender === undefined) || chat.Sender?.isClientUser();

      let willSenderChange = arr.length - 1 === index;
      if (isMine) willSenderChange ||= !arr[index + 1].Sender?.isClientUser();
      else willSenderChange ||= arr[index + 1].Sender?.Id.toString() !== chat.Sender?.Id.toString();

      const sendDate = new Date(chat.SendTime * 1000);

      if (chat.Type !== ChatType.Feed) {
        this.bubbles.push({
          key: chat.LogId.toString(),
          hasTail: willSenderChange && ChatTypeWithTail.includes(chat.Type),
          unread: 1,
          author: this.nextWithAuthor ?
            this.props.channel.getUserInfo(chat.Sender)?.Nickname ?? '' :
            '',
          isMine,
          time: sendDate,
          hasPadding: ChatTypeWithPadding.includes(chat.Type),
          chat,
        });
      } else {
        list.push(getContent(chat, this.props.chatList, this.props.channel));
      }

      this.nextWithAuthor = false;

      if (willSenderChange && this.bubbles.length > 0) {
        const chatItem = (
          <ChatItem
            isMine={isMine}
            profileImageSrc={this.props.channel.getUserInfo(chat.Sender)?.ProfileImageURL}
            key={chat.LogId.toString()}>
            {
              this.bubbles.map((bubble) => {
                return (
                  <ChatBubble
                    key={bubble.key}
                    hasTail={bubble.hasTail}
                    time={bubble.time}
                    author={bubble.author}
                    unread={bubble.unread}
                    isMine={bubble.isMine}
                    hasPadding={bubble.hasPadding}>
                    {
                      getContent(bubble.chat, this.props.chatList, this.props.channel)
                    }
                  </ChatBubble>
                );
              })
            }
          </ChatItem>
        );

        this.bubbles = [];
        this.nextWithAuthor = true;

        list.push(chatItem);
      }

      index++;
    }

    return (
        <Content onScroll={this.handleScroll.bind(this)}>
          {list}
          <div ref={this.refScrollEnd}/>
        </Content>
    );
  }
}
*/
export default ChatList;
