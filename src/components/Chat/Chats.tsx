import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

import ThemeColor from '../../assets/colors/theme';
import ChatroomColor from '../../assets/colors/chatroom';

import ChatItem from './ChatItem';
import Bubble from '../UiComponent/Bubble';

import PhotoChat from './PhotoChat';
import SearchChat from './SearchChat';
import ReplyChat from './ReplyChat';

import { Chat, ChatChannel, ChatType, PhotoAttachment } from 'node-kakao/dist';

const Content = styled.div`
display: flex;
flex-direction: column;
padding: 46px 27px 96px 42px;
overflow-y: scroll;
::-webkit-scrollbar {
  width: 3px;
  background: ${ ThemeColor.GREY_400};
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
    case ChatType.Photo: case ChatType.MultiPhoto:
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
            const { Question, ContentType, ContentList } = attachment;

            return <SearchChat question={Question} type={ContentType} list={ContentList}></SearchChat>
          })
        }
      </div>
    case ChatType.Reply:
      let prevChat = null;

      for (const c of chatList) {
        if (c.LogId.low === chat.PrevLogId.low) {
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
    default:
      return <div>
        <h5>{chat.Type}</h5>
        <a>{chat.Text}</a>
      </div>
  }
}

const Chats: React.FC<ChatsProps> = ({ channel, chatList }) => {
  let bubbles: JSX.Element[] = [];
  let nextWithAuthor = true

  const refScrollEnd = useRef() as any;
  const scrollEnd = () => {
    refScrollEnd.current.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollEnd, [scrollEnd]);

  return (
    <Content>
      {
        chatList
          .filter((chat) => chat.Channel.Id.low === channel.Id.low)
          .map((chat, index, arr) => {
            const isMine = (chat.Sender == undefined) || chat.Sender.isClientUser();
            let willSenderChange = arr.length - 1 === index;

            if (isMine) willSenderChange = willSenderChange || arr[index + 1].Sender !== undefined;
            else willSenderChange = willSenderChange || arr[index + 1].Sender?.Id.low !== chat.Sender?.Id.low;

            const sendDate = new Date(chat.SendTime * 1000);
            let content: JSX.Element = convertContent(chat, chatList);

            bubbles.push(<Bubble
              key={chat.MessageId}
              hasTail={willSenderChange}
              unread={1}
              author={nextWithAuthor ? chat.Sender?.Nickname : ''}
              isMine={isMine}
              time={sendDate}>
              {content}
            </Bubble>);

            nextWithAuthor = false;

            if (willSenderChange) {
              const chatItem = <ChatItem
                profileImageSrc={channel["channelInfo"].userInfoMap[chat.Sender?.Id.low]?.profileImageURL}
                key={chat.MessageId}>{bubbles}</ChatItem>;
              bubbles = [];
              nextWithAuthor = true;
              return chatItem;
            }
          })
      }
      <div ref={refScrollEnd} />
    </Content>
  );
};

export default Chats;
