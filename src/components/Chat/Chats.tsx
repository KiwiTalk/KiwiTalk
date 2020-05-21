import React, {createRef} from 'react';
import styled from 'styled-components';

import ThemeColor from '../../assets/colors/theme';

import ChatItem from './ChatItem';
import Bubble from '../UiComponent/Bubble';

import PhotoChat from './PhotoChat';
import SearchChat from './SearchChat';
import ReplyChat from './ReplyChat';

import {Chat, ChatChannel, ChatType, PhotoAttachment} from 'node-kakao/dist';

const Content = styled.div`
display: flex;
flex-direction: column;
padding: 46px 27px 96px 42px;
overflow-y: scroll;
::-webkit-scrollbar {
  width: 3px;
  background: ${ThemeColor.GREY_400};
}
`;

export interface ChatsProps {
    channel: ChatChannel
    chatList: Chat[]
}

const convertContent = (chat: Chat, chatList: Chat[]) => {
    switch (chat.Type) {
        case ChatType.Text:
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            return <a>{chat.Text}</a>
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

            for (const c of chatList) {
                if (c.LogId.getLowBits() === chat.PrevLogId.getLowBits()) {
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
            console.log(chat);
            return <a>{chat.AttachmentList}</a>
            break;
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
        console.log(this.props.channel.Id.getLowBits(), nextProps.chatList[nextProps.chatList.length - 1]?.Channel?.Id?.getLowBits())
        return this.props.chatList.length !== nextProps.chatList.length
            && this.props.channel.Id.getLowBits() === nextProps.chatList[nextProps.chatList.length - 1]?.Channel?.Id?.getLowBits();
    }

    componentDidUpdate() {
        this.refScrollEnd.current.scrollIntoView({behavior: "smooth"});
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
                            else willSenderChange = willSenderChange || arr[index + 1].Sender?.Id.getLowBits() !== chat.Sender?.Id.getLowBits();

                            const sendDate = new Date(chat.SendTime * 1000);
                            let content: JSX.Element = convertContent(chat, this.props.chatList);

                            this.bubbles.push(<Bubble
                                key={chat.MessageId}
                                hasTail={willSenderChange}
                                unread={1}
                                author={this.nextWithAuthor ? chat.Sender?.Nickname : ''}
                                isMine={isMine}
                                time={sendDate}>
                                {content}
                            </Bubble>);

                            this.nextWithAuthor = false;

                            if (willSenderChange) {
                                const chatItem = <ChatItem
                                    isMine={isMine}
                                    profileImageSrc={this.props.channel['channelInfo'].getUserInfo(chat.Sender)?.ProfileImageURL}
                                    key={chat.MessageId}>{this.bubbles}</ChatItem>;
                                this.bubbles = [];
                                this.nextWithAuthor = true;
                                return chatItem;
                            }
                        })
                }
                <div ref={this.refScrollEnd}/>
            </Content>
        );
    }
}

export default Chats;
