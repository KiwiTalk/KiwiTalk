import React from 'react';
import styled from 'styled-components';

import ThemeColor from '../../assets/colors/theme';
import ChatroomColor from '../../assets/colors/chatroom';

import ChatItem from './ChatItem';
import Bubble from '../UiComponent/Bubble';

import PhotoChat from './PhotoChat';

import { Chat, ChatChannel, ChatType, PhotoAttachment } from 'node-kakao/dist';
import SearchChat from './SearchChat';

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

const Chats: React.FC<ChatsProps> = ({ channel, chatList }) => {
  let bubbles: JSX.Element[] = [];
  let nextWithAuthor = true

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

            const sendDate = new Date(chat.SendTime);
            let content: JSX.Element = <a>{chat.Text}</a>

            switch (chat.Type) {
              case ChatType.Text:
                break;
              case ChatType.Photo: case ChatType.MultiPhoto: // MultiPhoto는 임시
                content = <div>
                  {
                    chat.AttachmentList.map((attachment: any) => {
                      attachment = attachment as PhotoAttachment;

                      return <PhotoChat width={attachment.Width} height={attachment.Height} url={attachment.ImageURL}></PhotoChat>
                    })
                  }
                </div>
                break;
              case ChatType.Search:
                content = <div>
                  {
                    chat.AttachmentList.map((attachment: any) => {
                      const { Question, ContentType, ContentList } = attachment;

                      return <SearchChat question={Question} type={ContentType} list={ContentList}></SearchChat>
                    })
                  }
                </div>
                break;
              default:
                content = <div>
                  <h5>{chat.Type}</h5>
                  <a>{chat.Text}</a>
                </div>
                break;
            }

            bubbles.push(<Bubble
              key={chat.MessageId}
              hasTail={willSenderChange}
              unread={1}
              author={nextWithAuthor ? chat.Sender?.Nickname : ''}
              isMine={isMine}
              time={`${sendDate.getHours()}:${sendDate.getMinutes()}`}>
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
    </Content>
  );
};

export default Chats;
