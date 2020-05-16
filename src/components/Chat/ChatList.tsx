import React from 'react';
import styled from 'styled-components';
import { ChatChannel } from "../../../public/src/NodeKakaoPureObject";
import ChatListItem from './ChatListItem';
import ProfileDefault from '../../assets/images/profile_default.svg'

const Wrapper = styled.div`
width: 309px;
flex: 1;
display: flex;
flex-direction: column;
background: #FFFFFF;
overflow-y: scroll;
::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}
`;

function extractRoomImage (channelInfo: ChatChannel['channelInfo']) {
  let imageUrl = channelInfo.roomImageURL || ProfileDefault

  channelInfo.chatmetaList.forEach((meta: any) => {
    if (meta.Type === 4) {
      const content = JSON.parse(meta.Content)
      imageUrl = content.imageUrl
    }
  })

  return imageUrl
}

const ChatList: React.FC<{ channelList: ChatChannel[] }> = ({ channelList }) => {
  return (
    <Wrapper>
      {channelList.map((channel) => <ChatListItem key={channel.id.low} lastChat={channel.lastChat ? channel.lastChat.text : ''} profileImageSrc={extractRoomImage(channel.channelInfo)} username={channel.channelInfo.name} />)}
    </Wrapper>
  );
};

export default ChatList;
