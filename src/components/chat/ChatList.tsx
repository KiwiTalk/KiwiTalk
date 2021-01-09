import { Chat, ChatChannel, ChatType, FeedType } from 'node-kakao';
import React, { createRef } from 'react';
import styled from 'styled-components';

import ThemeColor from '../../assets/colors/theme';
import ChatBubble from './items/ChatBubble';

import ChatItem from './items/ChatItem';

import convertChat, { toDeletedText } from './utils/chat-converter';
import { toDeletedAt } from './utils/feed-converter';

const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px 19px 8px 42px;
  margin: 8px 8px 64px 0px;
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

export interface ChatListProps {
  channel: ChatChannel;
  chatList: Chat[];
  selectedChannel: number;
}

interface BubbleProps {
  key: string;
  hasTail: boolean;
  unread: number;
  author: string;
  isMine: boolean;
  time: Date;
  hasPadding: boolean;
  chat: Chat;
}

const getContent = (chat: Chat, chatList: Chat[], channel: ChatChannel) => {
  if (chat.Type === ChatType.Feed) {
    try {
      const text = JSON.parse(chat.Text);

      if (text.feedType === FeedType.DELETE_TO_ALL) {
        console.log('deleted', chat);
        return toDeletedAt(chat.getFeed(), chat, chatList, channel);
      }
    } catch {
    }
  }

  return convertChat(chat, chatList, channel);
};

class ChatList extends React.Component<ChatListProps> {
  private bubbles: BubbleProps[] = [];
  private nextWithAuthor = true;
  private isScroll = false;

  private refScrollEnd = createRef() as any;

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
    const arr = this.props.chatList;
    let index = 0;
    for (const chat of this.props.chatList) {
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

export default ChatList;
