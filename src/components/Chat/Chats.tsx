import React, {createRef} from 'react';
import styled from 'styled-components';

import ThemeColor from '../../assets/colors/theme';

import ChatItem from './Item/ChatItem';
import ChatBubble from './Item/ChatBubble';

import {Chat, ChatChannel, ChatType} from 'node-kakao/dist';

import convertChat from './Utils/ChatConverter';

const Content = styled.div`
display: flex;
flex-direction: column;
padding: 0px 19px 8px 42px;
margin: 8px 8px 89px 0px;
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
    ChatType.Reply
]

const ChatTypeWithPadding = [
    ChatType.Text,
    ChatType.Search,
    ChatType.Reply
]

export interface ChatsProps {
    channel: ChatChannel
    chatList: Chat[]
}

class Chats extends React.Component<ChatsProps> {
    private bubbles: JSX.Element[] = [];
    private nextWithAuthor = true;

    private refScrollEnd = createRef() as any;

    shouldComponentUpdate(nextProps: ChatsProps, nextState: any) {
        return this.props.chatList.length !== nextProps.chatList.length
            && this.props.channel.Id.toString() === nextProps.chatList[nextProps.chatList.length - 1]?.Channel?.Id?.toString();
    }

    componentDidUpdate() {
        this.refScrollEnd.current.scrollIntoView({
            behavior: 'smooth'
        })
    }

    render() {
        return (
            <Content>
                {
                    this.props.chatList
                        .map((chat, index, arr) => {
                            const isMine = (chat.Sender === undefined) || chat.Sender.isClientUser();
                            let willSenderChange = arr.length - 1 === index; // 맨 마지막 index면 당연히 바뀜

                            if (isMine) willSenderChange = willSenderChange || (arr[index + 1].Sender !== undefined && !arr[index + 1].Sender.isClientUser()); 
                            else willSenderChange = willSenderChange || arr[index + 1].Sender?.Id.toString() !== chat.Sender?.Id.toString();

                            const sendDate = new Date(chat.SendTime * 1000);
                            let content: JSX.Element = convertChat(chat, this.props.chatList);

                            this.bubbles.push(<ChatBubble
                                key={chat.LogId.toString()}
                                hasTail={willSenderChange && ChatTypeWithTail.includes(chat.Type)}
                                unread={1}
                                author={this.nextWithAuthor ? chat.Sender?.Nickname : ''}
                                isMine={isMine}
                                time={sendDate}
                                hasPadding={ChatTypeWithPadding.includes(chat.Type)}>
                                {content}
                            </ChatBubble>);

                            this.nextWithAuthor = false;

                            if (willSenderChange) {
                                const chatItem = <ChatItem
                                    isMine={isMine}
                                    profileImageSrc={this.props.channel['channelInfo'].getUserInfo(chat.Sender)?.ProfileImageURL}
                                    key={chat.LogId.toString()}>{this.bubbles}</ChatItem>;
                                this.bubbles = [];
                                this.nextWithAuthor = true;
                                return chatItem;
                            }
                        })
                }
                <div ref={this.refScrollEnd} />
            </Content>
        );
    }
}

export default Chats;
