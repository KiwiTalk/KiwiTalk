import React, {createRef} from 'react';
import styled from 'styled-components';

import ThemeColor from '../../assets/colors/theme';
import ChatRoomColor from '../../assets/colors/chatroom';

import ChatItem from './ChatItem';
import Bubble from '../UiComponent/Bubble';

import PhotoChat from './PhotoChat';
import SearchChat from './SearchChat';
import ReplyChat from './ReplyChat';
import MapChat from './MapChat';
import VideoChat from './VideoChat';

import {Chat, ChatChannel, ChatType, PhotoAttachment, ReplyChat as ReplyChatObject, VideoAttachment} from 'node-kakao/dist';

const Content = styled.div`
display: flex;
flex-direction: column;
padding: -8px 19px -1px 42px;
margin: 8px 8px 97px 0px;
overflow-y: scroll;
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

const convertContent = (chat: Chat, chatList: Chat[]) => {
    switch (chat.Type) {
        case ChatType.Text:
            return <span>{chat.Text}</span>
        case ChatType.Photo:
        case ChatType.MultiPhoto:
            return <div>
                {
                    chat.AttachmentList.map((attachment: any) => {
                        attachment = attachment as PhotoAttachment;

                        return <PhotoChat
                            width={attachment.Width}
                            height={attachment.Height}
                            url={attachment.ImageURL}
                            ratio={chat.Type === ChatType.MultiPhoto ? 1 : -1}
                            limit={chat.Type === ChatType.MultiPhoto ? [200, 200] : [300, 500]}></PhotoChat>
                    })
                }
            </div>
        case ChatType.Video:
            const list = chat.AttachmentList.map((attachment: any) => {
                attachment = attachment as VideoAttachment;
                console.log(attachment);
                return <VideoChat
                    url={attachment.VideoURL}
                    width={attachment.Width}
                    height={attachment.Height}
                    duration={attachment.Duration} />
            })
        return <div>{list}</div>
        case ChatType.Search:
            return <div>
                {
                    chat.AttachmentList.map((attachment: any) => {
                        const {Question, ContentType, ContentList} = attachment;

                        return <SearchChat question={Question} type={ContentType} list={ContentList}></SearchChat>
                    })
                }
            </div>
        case ChatType.Reply:
            let prevChat = null;
            const a = chat as ReplyChatObject
            for (const c of chatList) {
                if (c.LogId.toString() === chat.PrevLogId.toString()) {
                    prevChat = c;
                    break;
                }
            }

            if (prevChat != null) {
                return <ReplyChat prevChat={prevChat} me={chat}></ReplyChat>
            } else {
                return <a>{chat.Text}</a>
            }
        case ChatType.Map:
            return <div>
                {
                    chat.AttachmentList.map((attachment: any) => {
                        const { Name, Lat, Lng } = attachment
                        console.log(attachment)
                        return <MapChat name={Name} url={''} latitude={Lat} longitude={Lng}></MapChat>
                    })
                }
            </div>
        default:
            return <div>
                <h5>{chat.Type}</h5>
                <a>{chat.Text}</a>
            </div>
    }
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
        console.log('call render');

        return (
            <Content>
                {
                    this.props.chatList
                        .map((chat, index, arr) => {
                            const isMine = (chat.Sender === undefined) || chat.Sender.isClientUser();
                            let willSenderChange = arr.length - 1 === index;

                            if (isMine) willSenderChange = willSenderChange || arr[index + 1].Sender !== undefined;
                            else willSenderChange = willSenderChange || arr[index + 1].Sender?.Id.toString() !== chat.Sender?.Id.toString();

                            const sendDate = new Date(chat.SendTime * 1000);
                            let content: JSX.Element = convertContent(chat, this.props.chatList);
                            
                            this.bubbles.push(<Bubble
                                key={chat.LogId.toString()}
                                hasTail={willSenderChange && ChatTypeWithTail.includes(chat.Type)}
                                unread={1}
                                author={this.nextWithAuthor ? chat.Sender?.Nickname : ''}
                                isMine={isMine}
                                time={sendDate}
                                hasPadding={ChatTypeWithPadding.includes(chat.Type)}>
                                {content}
                            </Bubble>);

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
