import React  from 'react';
import styled from 'styled-components';

import ThemeColor from '../../assets/colors/theme';
import ChatroomColor from '../../assets/colors/chatroom';

import ChatItem from './ChatItem';
import Bubble from '../UiComponent/Bubble';

import { Chat, ChatChannel, ChatType } from 'node-kakao/dist';

const Content = styled.div`
display: flex;
flex-direction: column;
padding: 46px 27px 96px 42px;
overflow-y: scroll;
::-webkit-scrollbar {
  width: 3px;
  background: ${ ThemeColor.GREY_400 };
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
          .filter((chat) => chat.Type === ChatType.Text && chat.Channel.Id.low === channel.Id.low)
          .map((chat, index, arr) => {
            const isMine = (chat.Sender == undefined) || chat.Sender.isClientUser();
            let willSenderChange = arr.length - 1 === index;

            if (isMine) willSenderChange = willSenderChange || arr[index + 1].Sender !== undefined;
            else willSenderChange = willSenderChange || arr[index + 1].Sender?.Id.low !== chat.Sender?.Id.low;

            const sendDate = new Date(chat.SendTime);

            bubbles.push(<Bubble key={ chat.MessageId }
                                 hasTail={ willSenderChange }
                                 unread={ 1 }
                                 author={ nextWithAuthor ? chat.Sender?.Nickname : '' }
                                 isMine={ isMine }
                                 time={ `${ sendDate.getHours() }:${ sendDate.getMinutes() }` }>{ chat.Text }</Bubble>);

            nextWithAuthor = false;

            if (willSenderChange) {
              const chatItem = <ChatItem
                profileImageSrc={ channel["channelInfo"].userInfoMap[chat.Sender?.Id.low]?.profileImageURL }
                key={ chat.MessageId }>{ bubbles }</ChatItem>;
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
